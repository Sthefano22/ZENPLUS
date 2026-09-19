import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = `
      SELECT 
        id,
        previous_status AS "previousStatus",
        new_status AS "newStatus",
        action_type AS "actionType",
        details,
        created_at AS "createdAt"
      FROM inventory.asset_timeline
      WHERE asset_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [id]);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    console.error('Error al consultar timeline:', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof err?.message === 'string' && err.message) || 'Error al obtener historial' 
      },
      { status: 500 }
    );
  }
}