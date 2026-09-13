# ZENPLUS OS

Infraestructura digital de ZENPLUS Desarrollo Inmobiliario.

## Estructura

```
ZENPLUS/
└── beta/
    ├── apps/api/     → Backend Fastify + Prisma
    ├── modules/      → Módulos de dominio
    ├── packages/     → Código compartido
    ├── database/     → Migraciones y seeds
    ├── docs/         → API, reportes, seguridad
    └── .github/      → CI/CD
```

## Células

| Célula | Alcance |
|--------|---------|
| Alpha | Inventory + Data |
| Beta | Platform + CRM |
| Gamma | Web + Frontend |

## Cómo levantar Beta

```bash
cd beta/apps/api
npm install
cp .env.example .env
# Editar .env con DATABASE_URL de Neon
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| POST | /public/leads | No | Lead intake desde Web |
| GET | /crm/leads/me | JWT | My Leads |
| POST | /crm/leads/:id/contact | JWT | Registrar contacto |
| POST | /crm/leads/:id/qualify | JWT | Convertir a Opportunity |
| GET | /crm/opportunities | JWT | Listar Opportunities |
| GET | /crm/pipeline | JWT | Pipeline por stage |

## Tests

```bash
cd beta/apps/api
npm test
```

## Documentación

- `beta/docs/api/` — Contratos de API
- `beta/docs/reports/` — Reportes de sprint y handover
- `beta/docs/security/` — Baseline de seguridad
- `beta/docs/adr/` — Decisiones de arquitectura

## Repositorio

https://github.com/Sthefano22/ZENPLUS

## ZENPLUS Digital Lab

Construimos bienestar, creamos patrimonio.