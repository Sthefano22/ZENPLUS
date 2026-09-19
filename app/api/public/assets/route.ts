import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Catálogo público para clientes (INV-008)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get('assetType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const conditions: string[] = ["a.status = 'AVAILABLE'"];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Filtro por tipo (LOT, APARTMENT)
    if (assetType) {
      conditions.push(`a.asset_type = $${paramIndex}`);
      values.push(assetType.toUpperCase());
      paramIndex++;
    }

    // Filtro por precio mínimo
    if (minPrice) {
      conditions.push(`a.current_price >= $${paramIndex}`);
      values.push(Number(minPrice));
      paramIndex++;
    }

    // Filtro por precio máximo
    if (maxPrice) {
      conditions.push(`a.current_price <= $${paramIndex}`);
      values.push(Number(maxPrice));
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT 
        a.id,
        a.code,
        a.name,
        a.description,
        a.asset_type AS "assetType",
        a.status,
        a.area_m2 AS "areaM2",
        a.currency,
        a.current_price AS "currentPrice",
        o.trade_name AS "developer"
      FROM inventory.assets a
      LEFT JOIN core.organizations o ON a.owner_party_id = o.party_id
      WHERE ${whereClause}
      ORDER BY a.current_price ASC;
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error('Error en catálogo público:', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { 
        success: false, 
        error: (typeof err?.message === 'string' && err.message) || 'Error al consultar catálogo' 
      },
      { status: 500 }
    );
  }
}