import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Seed Ola 1 + Ola 2 ---");

  // ============================================
  // 1. USER (advisor)
  // ============================================
  const passwordHash = await bcrypt.hash("secret123", 10);

  const advisor = await prisma.users.upsert({
    where: { email: "advisor@zenplus.pe" },
    update: {},
    create: {
      id: randomUUID(),
      email: "advisor@zenplus.pe",
      password_hash: passwordHash,
      first_name: "Asesor",
      last_name: "Demo",
      role: "ADVISOR",
    },
  });
  console.log("Advisor:", advisor.id);

  // ============================================
  // 2. PARTY
  // ============================================
  const party = await prisma.parties.create({
    data: {
      id: randomUUID(),
      party_type: "PERSON",
      full_name: "Cliente Demo",
      email: "demo@example.com",
      phone: "+51999999999",
    },
  });
  console.log("Party:", party.id);

  // ============================================
  // 3. PROJECTS
  // ============================================
  const torreZenId = randomUUID();
  const torreZen = await prisma.projects.upsert({
    where: { id: torreZenId },
    update: {},
    create: {
      id: torreZenId,
      code: "PRJ-MIRA-01",
      name: "Torre Zen Miraflores",
      description: "Edificio residencial de lujo con vista al mar.",
      status: "CONSTRUCTION",
      district: "Miraflores",
      city: "Lima",
    },
  });

  const lasLomasId = randomUUID();
  const lasLomas = await prisma.projects.upsert({
    where: { id: lasLomasId },
    update: {},
    create: {
      id: lasLomasId,
      code: "PRJ-CIEN-02",
      name: "Condominio Campestre Las Lomas",
      description: "Exclusivo desarrollo campestre con lotes desde 500m2.",
      status: "PRE_SALE",
      district: "Cieneguilla",
      city: "Lima",
    },
  });
  console.log("Projects:", torreZen.code, lasLomas.code);

  // ============================================
  // 4. ASSETS
  // ============================================
  const assetsData = [
    { code: "DEP-MIRA-101", title: "Departamento Flat 101 - Torre Zen", description: "2 dormitorios, balcón.", price: 165000, area: 85.5, type: "APARTMENT", projectId: torreZenId },
    { code: "DEP-MIRA-102", title: "Departamento Flat 102 - Torre Zen", description: "3 dormitorios con cochera.", price: 185000, area: 95.0, type: "APARTMENT", projectId: torreZenId },
    { code: "DEP-MIRA-201", title: "Departamento Premium 201 - Torre Zen", description: "Terraza privada y cuarto de servicio.", price: 240000, area: 120.0, type: "APARTMENT", projectId: torreZenId },
    { code: "DEP-MIRA-PH", title: "Penthouse Dúplex Torre Zen", description: "Piso 12 con piscina privada.", price: 350000, area: 180.0, type: "APARTMENT", projectId: torreZenId },
    { code: "LOT-CIEN-01", title: "Lote Campestre Manzana A-01", description: "Frente a parque central.", price: 75000, area: 500.0, type: "LOT", projectId: lasLomasId },
    { code: "LOT-CIEN-02", title: "Lote Campestre Manzana A-02", description: "Vista panorámica al valle.", price: 82000, area: 520.0, type: "LOT", projectId: lasLomasId },
  ];

  const assetIds: Record<string, string> = {};

  for (const a of assetsData) {
    const existing = await prisma.assets.findUnique({ where: { code: a.code } });
    if (existing) {
      assetIds[a.code] = existing.id;
      continue;
    }
    const created = await prisma.assets.create({
      data: {
        id: randomUUID(),
        code: a.code,
        title: a.title,
        type: a.type,
        status: "AVAILABLE",
        price: a.price,
        currency: "USD",
        area: a.area,
        project_id: a.projectId,
        commercial_status: "AVAILABLE",
        publication_status: "PUBLISHED",
        details: a.description ? ({ description: a.description } as any) : undefined,
      },
    });
    assetIds[a.code] = created.id;
  }
  console.log(`Assets: ${assetsData.length}`);

  // ============================================
  // 5. LEAD
  // ============================================
  const lead = await prisma.leads.create({
    data: {
      id: randomUUID(),
      source: "WEB_FORM",
      full_name: "Cliente Demo",
      email: "demo@example.com",
      phone: "+51999999999",
      message: "Quiero info de Torre Zen",
      asset_id: assetIds["DEP-MIRA-101"],
      party_id: party.id,
      assigned_to: advisor.id,
      status: "ASSIGNED",
    },
  });
  console.log("Lead:", lead.id);

  // ============================================
  // 6. OPPORTUNITY
  // ============================================
  const opportunity = await prisma.opportunities.create({
    data: {
      id: randomUUID(),
      lead_id: lead.id,
      title: "Oportunidad Torre Zen",
      stage: "QUALIFICATION",
      amount: 165000,
      currency: "USD",
    },
  });

  console.log("--- Seed complete ---");
  console.log("Advisor login: advisor@zenplus.pe / secret123");
  console.log("Opportunity ID:", opportunity.id);
  console.log("Projects:", torreZen.code, lasLomas.code);
  console.log("Assets:", assetsData.map((a) => a.code).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());