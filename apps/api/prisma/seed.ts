import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const party = await prisma.party.create({
    data: {
      type: "PERSON",
      fullName: "Cliente Demo",
      email: "demo@example.com",
      phone: "+51999999999",
    },
  });

  await prisma.lead.create({
    data: {
      source: "WEB_FORM",
      fullName: "Cliente Demo",
      email: "demo@example.com",
      phone: "+51999999999",
      message: "Quiero info del Lote Residencial A-12",
      assetId: "LOT-ZN-001",
      partyId: party.id,
      assignedTo: "advisor-1",
      status: "ASSIGNED",
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());