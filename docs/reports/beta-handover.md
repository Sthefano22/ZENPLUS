# Handover - Célula Beta

## Estado final de Beta en Ola 1

Beta completa su parte del Exit Gate de Ola 1 con 6 de 8 criterios. Los 2 pendientes (Data Scope y AuthZ) dependen de IAM real, que es responsabilidad de Gamma.

## Qué se entrega

### Código
- `apps/api/` - Backend Fastify + Prisma + PostgreSQL
- Tests: 17 passing en 3 archivos
- CI: `.github/workflows/ci.yml`

### Endpoints
- `POST /public/leads` - Lead intake desde Web
- `GET /crm/leads/me` - My Leads
- `POST /crm/leads/:id/contact` - Registrar contacto
- `POST /crm/leads/:id/qualify` - Convertir a Opportunity
- `GET /crm/opportunities` - Listar Opportunities
- `GET /crm/opportunities/:id` - Detalle
- `GET /crm/pipeline` - Pipeline por stage
- `PATCH /crm/opportunities/:id/stage` - Cambiar stage

### Documentación
- `docs/api/lead-intake.md`
- `docs/api/crm-endpoints.md`
- `docs/api/opportunity-endpoints.md`
- `docs/security/no-subir-db-a-git.md`
- `docs/security/sprint-4-verification.md`
- `docs/reports/golden-e2e-beta.md`

### Base de datos
- Schemas: `crm`, `iam` en Neon
- Tablas: `crm.lead`, `crm.activity`, `crm.party`, `crm.opportunity`
- Migraciones versionadas en `apps/api/prisma/migrations/`

## Cómo levantar el proyecto

```bash
cd apps/api
npm install
cp .env.example .env
# pegar DATABASE_URL de Neon
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev