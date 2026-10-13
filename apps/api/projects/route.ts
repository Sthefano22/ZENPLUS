import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Listado de Proyectos con agregación de disponibilidad (ALP2-006)
// Agrega el inventario para reflejar unidades totales, disponibles, reservadas y precio desde.
export async function GET() {
  try {
    const query = `
      SELECT 
        p.id AS "projectId",
        p.name AS "projectName",
        p.code AS "projectCode",
        p.district,
        p.city,
        COUNT(a.id)::int AS "totalUnits",
        COUNT(CASE 
          WHEN a.commercial_status = 'AVAILABLE' 
           AND (h.reservation_id IS NULL OR h.expires_at <= CURRENT_TIMESTAMP) 
          THEN 1 
        END)::int AS "availableUnits",
        COUNT(CASE 
          WHEN a.commercial_status = 'RESERVATION_HOLD' 
            OR (h.reservation_id IS NOT NULL AND h.expires_at > CURRENT_TIMESTAMP) 
            OR a.commercial_status = 'RESERVED' 
          THEN 1 
        END)::int AS "reservedUnits",
        COUNT(CASE WHEN a.commercial_status = 'SOLD' THEN 1 END)::int AS "soldUnits",
        COALESCE(MIN(a.price), 0)::numeric AS "minPrice",
        COALESCE(MAX(a.price), 0)::numeric AS "maxPrice",
        CASE 
          WHEN COUNT(a.id) > 0 THEN 
            ROUND((COUNT(CASE 
              WHEN a.commercial_status = 'AVAILABLE' 
               AND (h.reservation_id IS NULL OR h.expires_at <= CURRENT_TIMESTAMP) 
              THEN 1 
            END)::numeric / COUNT(a.id)::numeric) * 100, 2)
          ELSE 0 
        END AS "availabilityPercentage"
      FROM inventory.projects p
      LEFT JOIN public.assets a ON p.id = a.project_id
      LEFT JOIN public.asset_active_hold h ON a.id = h.asset_id
      GROUP BY p.id, p.name, p.code, p.district, p.city
      ORDER BY p.name ASC;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error('Error en agregación de proyectos (ALP2-006):', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof err?.message === 'string' && err.message) || 'Error al agregar disponibilidad' 
      },
      { status: 500 }
    );
  }
}
