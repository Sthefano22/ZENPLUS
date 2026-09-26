import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Consulta de inventario con proyección de disponibilidad (ALP2-001 / ALP2-003 / ALP2-004)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');

    const conditions: string[] = ['1=1'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (minPrice) {
      conditions.push(`a.price >= $${paramIndex}`);
      values.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`a.price <= $${paramIndex}`);
      values.push(Number(maxPrice));
      paramIndex++;
    }

    if (status) {
      conditions.push(`a.commercial_status = $${paramIndex}`);
      values.push(status.toUpperCase());
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Proyección calculada: si el hold expiró, se computa como AVAILABLE
    const query = `
      SELECT 
        a.id,
        a.code,
        a.title,
        a.description,
        a.price,
        a.area,
        CASE 
          WHEN h.reservation_id IS NOT NULL AND h.expires_at > CURRENT_TIMESTAMP THEN 'RESERVATION_HOLD'
          ELSE a.commercial_status 
        END AS "commercialStatus",
        a.publication_status AS "publicationStatus",
        h.expires_at AS "holdExpiresAt"
      FROM assets a
      LEFT JOIN asset_active_hold h ON a.id = h.asset_id
      WHERE ${whereClause}
      ORDER BY a.price ASC;
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error('Error al consultar inventario:', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof err?.message === 'string' && err.message) || 'Error interno al consultar activos' 
      },
      { status: 500 }
    );
  }
}

// POST: Transacción atómica de reserva / hold (ALP2-002 / ALP2-004 / ALP2-005)
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { assetId, reservationId, actorId } = body;

    if (!assetId || !reservationId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros obligatorios: assetId y reservationId' },
        { status: 400 }
      );
    }

    // Iniciar transacción atómica (ACID)
    await client.query('BEGIN');

    // 1. Bloqueo pesimista de fila: SELECT ... FOR UPDATE (ALP2-005)
    // Impide condiciones de carrera si dos asesores reservan el mismo activo en paralelo
    const selectQuery = `
      SELECT id, commercial_status 
      FROM assets 
      WHERE id = $1 
      FOR UPDATE;
    `;
    const assetRes = await client.query(selectQuery, [assetId]);

    if (assetRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'El activo inmobiliario no existe' },
        { status: 404 }
      );
    }

    const currentStatus = assetRes.rows[0].commercial_status;

    // 2. Verificar que no exista un hold activo no expirado
    const holdQuery = `
      SELECT reservation_id, expires_at 
      FROM asset_active_hold 
      WHERE asset_id = $1 AND expires_at > CURRENT_TIMESTAMP;
    `;
    const activeHoldRes = await client.query(holdQuery, [assetId]);

    // 3. Regla de elegibilidad para reservar (ALP2-001 / ALP2-005)
   if (currentStatus !== 'AVAILABLE' || (activeHoldRes.rowCount ?? 0) > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Conflicto: El activo ya no está disponible para reserva (ocupado o en proceso de hold)' 
        },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Crear o renovar el hold por 15 minutos (ALP2-004)
    const upsertHoldQuery = `
      INSERT INTO asset_active_hold (asset_id, reservation_id, expires_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
      ON CONFLICT (asset_id) DO UPDATE 
      SET reservation_id = EXCLUDED.reservation_id, 
          expires_at = EXCLUDED.expires_at;
    `;
    await client.query(upsertHoldQuery, [assetId, reservationId]);

    // 5. Actualizar el estado comercial en la tabla de activos
    await client.query(
      `UPDATE assets SET commercial_status = 'RESERVATION_HOLD', updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [assetId]
    );

    // 6. Auditoría: registrar en historial inmutable (ALP2-002)
    const historyQuery = `
      INSERT INTO asset_availability_history (asset_id, previous_status, new_status, reason, actor_id)
      VALUES ($1, 'AVAILABLE', 'RESERVATION_HOLD', 'HOLD_RESERVATION_CREATED', $2);
    `;
    await client.query(historyQuery, [assetId, actorId || null]);

    // Confirmar todas las operaciones de forma atómica
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Reserva temporal (hold) creada exitosamente con bloqueo transaccional.',
      data: {
        assetId,
        reservationId,
        status: 'RESERVATION_HOLD',
        expiresInMinutes: 15,
      },
    });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de reserva:', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof err?.message === 'string' && err.message) || 'Error al procesar la reserva' 
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}