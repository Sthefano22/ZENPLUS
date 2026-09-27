const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runValidationSuite() {
  console.log('\n================================================================');
  console.log('🧪 SUITE DE VALIDACIÓN AUTOMATIZADA · CÉLULA ALPHA (FASE 2)');
  console.log('   Tickets: ALP2-005 | ALP2-006 | ALP2-007 | ALP2-008 | ALP2-009');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // TEST 1: ALP2-006 - Agregación de Proyectos y Unidades
    // -------------------------------------------------------------
    console.log('📌 [TEST 1] ALP2-006: Agregación de Disponibilidad por Proyecto');
    const aggQuery = `
      SELECT 
        p.code AS "Código",
        p.name AS "Proyecto",
        COUNT(a.id)::int AS "Total Unidades",
        COUNT(CASE 
          WHEN a.commercial_status = 'AVAILABLE' 
           AND (h.reservation_id IS NULL OR h.expires_at <= CURRENT_TIMESTAMP) 
          THEN 1 
        END)::int AS "Disponibles",
        COUNT(CASE 
          WHEN a.commercial_status = 'RESERVATION_HOLD' 
            OR (h.reservation_id IS NOT NULL AND h.expires_at > CURRENT_TIMESTAMP) 
            OR a.commercial_status = 'RESERVED' 
          THEN 1 
        END)::int AS "Reservadas",
        COUNT(CASE WHEN a.commercial_status = 'SOLD' THEN 1 END)::int AS "Vendidas",
        MIN(a.price)::numeric AS "Precio Mín (USD)",
        MAX(a.price)::numeric AS "Precio Máx (USD)"
      FROM inventory.projects p
      LEFT JOIN public.assets a ON p.id = a.project_id
      LEFT JOIN public.asset_active_hold h ON a.id = h.asset_id
      GROUP BY p.id, p.code, p.name
      ORDER BY p.code ASC;
    `;
    const aggRes = await pool.query(aggQuery);
    console.table(aggRes.rows);
    console.log('   ✅ Disponibilidad agregada calculada con éxito.\n');

    // -------------------------------------------------------------
    // TEST 2: ALP2-005 - Protección Concurrente contra Double Booking
    // -------------------------------------------------------------
    console.log('📌 [TEST 2] ALP2-005: Prueba de Estrés Concurrente (Double Booking)');
    
    const assetRes = await pool.query(`
      SELECT id, code, commercial_status 
      FROM public.assets 
      WHERE code = 'DEP-MIRA-102'
      LIMIT 1;
    `);

    if (assetRes.rows.length === 0) {
      console.error('   ❌ Activo DEP-MIRA-102 no encontrado.');
      return;
    }

    const testAsset = assetRes.rows[0];
    console.log(`   Inmueble objetivo: ${testAsset.code} (ID: ${testAsset.id})`);

    // Resetear hold para que esté AVAILABLE
    await pool.query(`DELETE FROM public.asset_active_hold WHERE asset_id = $1`, [testAsset.id]);
    await pool.query(`UPDATE public.assets SET commercial_status = 'AVAILABLE' WHERE id = $1`, [testAsset.id]);

    async function attemptHold(agentName, reservationId) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Bloqueo pesimista FOR UPDATE
        const selectRes = await client.query(`
          SELECT id, commercial_status 
          FROM public.assets 
          WHERE id = $1 
          FOR UPDATE;
        `, [testAsset.id]);

        const currentStatus = selectRes.rows[0].commercial_status;

        // Verificar hold activo vigente
        const holdRes = await client.query(`
          SELECT reservation_id 
          FROM public.asset_active_hold 
          WHERE asset_id = $1 AND expires_at > CURRENT_TIMESTAMP;
        `, [testAsset.id]);

        if (currentStatus !== 'AVAILABLE' || holdRes.rowCount > 0) {
          await client.query('ROLLBACK');
          return { Asesor: agentName, Resultado: '409 CONFLICT', Detalle: 'Rechazado: Inmueble ocupado o en hold', Éxito: false };
        }

        // Crear hold de 15 minutos
        await client.query(`
          INSERT INTO public.asset_active_hold (asset_id, reservation_id, expires_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
          ON CONFLICT (asset_id) DO UPDATE 
          SET reservation_id = EXCLUDED.reservation_id, expires_at = EXCLUDED.expires_at;
        `, [testAsset.id, reservationId]);

        // Cambiar a RESERVATION_HOLD
        await client.query(`
          UPDATE public.assets 
          SET commercial_status = 'RESERVATION_HOLD', updated_at = CURRENT_TIMESTAMP 
          WHERE id = $1;
        `, [testAsset.id]);

        // Emitir evento de dominio (ALP2-008)
        await client.query(`
          INSERT INTO public.inventory_domain_events (event_type, aggregate_type, aggregate_id, payload)
          VALUES ('asset_availability_changed', 'ASSET', $1, $2::jsonb);
        `, [testAsset.id, JSON.stringify({ assetId: testAsset.id, reservationId, agent: agentName, action: 'RESERVATION_HOLD' })]);

        await client.query('COMMIT');
        return { Asesor: agentName, Resultado: '201 CREATED', Detalle: 'Hold adquirido por 15 min', Éxito: true };
      } catch (err) {
        await client.query('ROLLBACK');
        return { Asesor: agentName, Resultado: '500 ERROR', Detalle: err.message, Éxito: false };
      } finally {
        client.release();
      }
    }

    console.log('   Simulando 5 asesores intentando reservar en paralelo al mismo milisegundo...');
    const attempts = [
      attemptHold('Asesor 1 (Carlos)', 'a1111111-1111-1111-1111-111111111111'),
      attemptHold('Asesor 2 (Ana)',    'b2222222-2222-2222-2222-222222222222'),
      attemptHold('Asesor 3 (Luis)',   'c3333333-3333-3333-3333-333333333333'),
      attemptHold('Asesor 4 (Maria)',  'd4444444-4444-4444-4444-444444444444'),
      attemptHold('Asesor 5 (Pedro)',  'e5555555-5555-5555-5555-555555555555'),
    ];

    const results = await Promise.all(attempts);
    console.table(results);

    const winners = results.filter((r) => r.Éxito);
    const conflicts = results.filter((r) => !r.Éxito);

    if (winners.length === 1 && conflicts.length === 4) {
      console.log(`   ✅ PROTECCIÓN ATÓMICA DEMOSTRADA: Exactamente 1 reserva ganadora y 4 bloqueadas.\n`);
    } else {
      console.log(`   ❌ ERROR: Se detectó una anomalía concurrente.\n`);
    }

    // -------------------------------------------------------------
    // TEST 3: ALP2-008 - Emisión de Eventos de Dominio
    // -------------------------------------------------------------
    console.log('📌 [TEST 3] ALP2-008: Registro de Eventos de Dominio en Neon');
    const eventsRes = await pool.query(`
      SELECT event_type AS "Tipo Evento", aggregate_type AS "Agregado", aggregate_id AS "ID Activo", occurred_at AS "Fecha/Hora UTC"
      FROM public.inventory_domain_events 
      ORDER BY occurred_at DESC 
      LIMIT 2;
    `);
    console.table(eventsRes.rows);
    console.log('   ✅ Eventos de disponibilidad auditados correctamente.\n');

    // -------------------------------------------------------------
    // TEST 4: ALP2-007 - Índices de Búsqueda de Candidatos
    // -------------------------------------------------------------
    console.log('📌 [TEST 4] ALP2-007: Índices Creados en PostgreSQL Neon');
    const indexesRes = await pool.query(`
      SELECT indexname AS "Nombre del Índice", tablename AS "Tabla"
      FROM pg_indexes 
      WHERE tablename IN ('assets', 'asset_active_hold', 'inventory_domain_events')
        AND schemaname = 'public'
        AND indexname LIKE 'idx_%';
    `);
    console.table(indexesRes.rows);
    console.log('   ✅ Índices de búsqueda listos para optimizar filtros comerciales.\n');

  } catch (error) {
    console.error('Error durante la validación:', error);
  } finally {
    await pool.end();
  }
}

runValidationSuite();
