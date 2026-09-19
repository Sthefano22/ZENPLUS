import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. OBLIGATORIO: Función GET para listar los inmuebles
export async function GET() {
  try {
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
        o.trade_name AS "owner"
      FROM inventory.assets a
      LEFT JOIN core.organizations o ON a.owner_party_id = o.party_id
      ORDER BY a.created_at DESC;
    `;
    const result = await pool.query(query);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    console.error('Error en GET /api/assets:', error);
    const err = error as Record<string, unknown>;
    const detail =
      (typeof err?.message === 'string' && err.message) ||
      'Error interno al consultar activos';

    return NextResponse.json({ success: false, error: detail }, { status: 500 });
  }
}

// 2. Función POST para registrar nuevos inmuebles (INV-001)
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { code, name, description, assetType, areaM2, currentPrice, currency = 'USD' } = body;

    if (!code || !name || !assetType || !currentPrice) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const orgResult = await client.query('SELECT party_id FROM core.organizations LIMIT 1;');
    const defaultOwnerPartyId = orgResult.rows[0]?.party_id || null;

    const insertAssetQuery = `
      INSERT INTO inventory.assets (
        code, 
        name, 
        description, 
        asset_type, 
        status, 
        area_m2, 
        currency, 
        current_price, 
        owner_party_id
      )
      VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $8)
      RETURNING id, code, name, status, created_at;
    `;

    const assetRes = await client.query(insertAssetQuery, [
      code.toUpperCase().trim(),
      name.trim(),
      description || null,
      assetType,
      areaM2 ? Number(areaM2) : null,
      currency,
      Number(currentPrice),
      defaultOwnerPartyId,
    ]);

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: assetRes.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    if (client) await client.query('ROLLBACK');
    console.error('Error en POST /api/assets:', error);
    const err = error as Record<string, unknown>;
    return NextResponse.json(
      { success: false, error: (typeof err?.message === 'string' && err.message) || 'Error al guardar' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}