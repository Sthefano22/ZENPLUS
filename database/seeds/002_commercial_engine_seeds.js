const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedCommercialEngine() {
  const client = await pool.connect();
  try {
    console.log('--- Iniciando Seeds Commercial Engine (ALP2-009) ---');
    await client.query('BEGIN');

    // 1. Proyectos Inmobiliarios (inventory.projects)
    const p1Query = `
      INSERT INTO inventory.projects (code, name, description, status, district, city, updated_at)
      VALUES 
        ('PRJ-MIRA-01', 'Torre Zen Miraflores', 'Edificio residencial de lujo con vista al mar y áreas comunes premium.', 'CONSTRUCTION', 'Miraflores', 'Lima', CURRENT_TIMESTAMP),
        ('PRJ-CIEN-02', 'Condominio Campestre Las Lomas', 'Exclusivo desarrollo campestre con lotes desde 500m2 y club house.', 'PRE_SALE', 'Cieneguilla', 'Lima', CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO UPDATE 
      SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP
      RETURNING id, code, name;
    `;
    const projectsRes = await client.query(p1Query);
    console.log(`Proyectos listos: ${projectsRes.rowCount}`);

    const mirafloresId = projectsRes.rows.find((p) => p.code === 'PRJ-MIRA-01')?.id;
    const cieneguillaId = projectsRes.rows.find((p) => p.code === 'PRJ-CIEN-02')?.id;

    // 2. Activos/Unidades Inmobiliarias (public.assets)
    const assetsData = [
      // Torre Zen Miraflores
      {
        code: 'DEP-MIRA-101',
        title: 'Departamento Flat 101 - Torre Zen',
        description: 'Departamento de 2 dormitorios, balcón con vista a parque y acabados de cuarzo.',
        price: 165000,
        area: 85.5,
        projectId: mirafloresId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'DEP-MIRA-102',
        title: 'Departamento Flat 102 - Torre Zen',
        description: 'Departamento de 3 dormitorios con cochera techada y vista exterior.',
        price: 185000,
        area: 95.0,
        projectId: mirafloresId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'DEP-MIRA-201',
        title: 'Departamento Premium 201 - Torre Zen',
        description: 'Amplio departamento con terraza privada, 3 dormitorios y cuarto de servicio.',
        price: 240000,
        area: 120.0,
        projectId: mirafloresId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'DEP-MIRA-PH',
        title: 'Penthouse Dúplex Torre Zen',
        description: 'Exclusivo Penthouse en piso 12 con piscina privada, terraza BBQ y vista panorámica.',
        price: 350000,
        area: 180.0,
        projectId: mirafloresId,
        commercialStatus: 'RESERVED',
        publicationStatus: 'PUBLISHED',
      },

      // Condominio Campestre Las Lomas
      {
        code: 'LOT-CIEN-01',
        title: 'Lote Campestre Manzana A-01',
        description: 'Lote plano con frente a parque central, punto de agua y cerco vivo.',
        price: 75000,
        area: 500.0,
        projectId: cieneguillaId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'LOT-CIEN-02',
        title: 'Lote Campestre Manzana A-02',
        description: 'Lote con excelente orientación solar y vista a la quebrada.',
        price: 95000,
        area: 650.0,
        projectId: cieneguillaId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'LOT-CIEN-03',
        title: 'Lote Esquina Manzana B-05',
        description: 'Lote en esquina estratégica con doble acceso y doble frente.',
        price: 120000,
        area: 800.0,
        projectId: cieneguillaId,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
      {
        code: 'LOT-CIEN-04',
        title: 'Lote Premium Manzana C-10',
        description: 'Lote amplio colindante a zona de reserva ecológica y laguna privada.',
        price: 150000,
        area: 1000.0,
        projectId: cieneguillaId,
        commercialStatus: 'SOLD',
        publicationStatus: 'UNPUBLISHED',
      },

      // Activo independiente sin proyecto
      {
        code: 'LOT-LURIN-12',
        title: 'Lote Urbano San Pedro de Lurín',
        description: 'Terreno urbano independizado con zonificación RDB listo para construir.',
        price: 45000,
        area: 300.0,
        projectId: null,
        commercialStatus: 'AVAILABLE',
        publicationStatus: 'PUBLISHED',
      },
    ];

    for (const a of assetsData) {
      const insertQuery = `
        INSERT INTO public.assets (
          code, title, description, price, area, project_id, commercial_status, publication_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO UPDATE 
        SET title = EXCLUDED.title,
            price = EXCLUDED.price,
            area = EXCLUDED.area,
            project_id = EXCLUDED.project_id,
            commercial_status = EXCLUDED.commercial_status,
            publication_status = EXCLUDED.publication_status,
            updated_at = CURRENT_TIMESTAMP;
      `;
      await client.query(insertQuery, [
        a.code,
        a.title,
        a.description,
        a.price,
        a.area,
        a.projectId,
        a.commercialStatus,
        a.publicationStatus,
      ]);
    }

    await client.query('COMMIT');
    console.log(`✅ Seeds insertados con éxito: 2 Proyectos y ${assetsData.length} Activos Inmobiliarios.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error ejecutando seeds:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCommercialEngine();
