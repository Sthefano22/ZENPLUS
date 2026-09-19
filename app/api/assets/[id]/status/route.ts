import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['IN_REVIEW'],
  IN_REVIEW: ['AVAILABLE', 'DRAFT'],
  AVAILABLE: ['RESERVED', 'IN_REVIEW', 'ARCHIVED'],
  RESERVED: ['SOLD', 'AVAILABLE'],
  SOLD: [],
  ARCHIVED: ['DRAFT'],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  try {
    const { id } = await params;
    const body = await request.json();
    const { nextStatus, notes } = body;

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, error: 'El campo nextStatus es requerido' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // 1. Obtener estado actual
    const currentAssetRes = await client.query(
      'SELECT id, status, code FROM inventory.assets WHERE id = $1 FOR UPDATE;',
      [id]
    );

    if (currentAssetRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Activo no encontrado' },
        { status: 404 }
      );
    }

    const currentStatus = currentAssetRes.rows[0].status;

    // 2. Validar transición
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          success: false,
          error: `Transición inválida: No se puede cambiar de ${currentStatus} a ${nextStatus}`,
        },
        { status: 422 }
      );
    }

    // 3. Actualizar activo
    const updateRes = await client.query(
      `
        UPDATE inventory.assets
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, code, status, updated_at;
      `,
      [nextStatus, id]
    );

    // 4. Registrar evento en Timeline (INV-009)
    await client.query(
      `
        INSERT INTO inventory.asset_timeline (asset_id, previous_status, new_status, action_type, details)
        VALUES ($1, $2, $3, 'STATUS_CHANGE', $4);
      `,
      [id, currentStatus, nextStatus, notes || `Transición automática a ${nextStatus}`]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: updateRes.rows[0],
      message: `Activo ${currentAssetRes.rows[0].code} actualizado a ${nextStatus}`,
    });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estado:', error);
    const err = error as Record<string, unknown>;
    const detail =
      (typeof err?.message === 'string' && err.message) ||
      'Error interno al actualizar estado';

    return NextResponse.json({ success: false, error: detail }, { status: 500 });
  } finally {
    client.release();
  }
}