import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const rows = await prisma.$queryRawUnsafe(`
  SELECT table_schema || '.' || table_name AS tabla
  FROM information_schema.tables 
  WHERE table_schema IN ('crm','operation','finance','core','inventory','iam')
    AND table_type = 'BASE TABLE'
  ORDER BY table_schema, table_name;
`);
console.table(rows);

// Contar filas de operations por schema (para saber cuál tiene las 4 filas)
try {
  const c = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM crm.operations`);
  console.log('crm.operations filas:', c[0].n);
} catch (e) { console.log('crm.operations:', e.message.split('\n')[0]); }

try {
  const c = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM operation.operations`);
  console.log('operation.operations filas:', c[0].n);
} catch (e) { console.log('operation.operations:', e.message.split('\n')[0]); }

await prisma.$disconnect();
