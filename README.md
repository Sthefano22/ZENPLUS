# ZENPLUS OS

Infraestructura digital de ZENPLUS Desarrollo Inmobiliario.

Un solo ecosistema, varias experiencias.

---

## ⚠️ Reglas del repositorio

### 1. NO subir `.env` ni credenciales

- Solo se sube `.env.example` (plantilla sin valores reales).
- El `.env` con `DATABASE_URL`, `JWT_SECRET` y demás credenciales vive **solo en tu laptop**.
- Si un secreto se filtra, se rota inmediatamente en Neon.

### 2. NO hacer push directo a `main`

- Toda contribución va por `feature/*` + Pull Request.
- Ejemplos de branches:
  - `feature/alpha-inventory-assets`
  - `feature/gamma-web-home`
  - `feature/beta-crm-opportunity`
- `main` está protegido. Los PRs requieren review antes de mergear.

### 3. Mismo monorepo, mismas convenciones

- **No repositorios paralelos.** Todo vive en este monorepo.
- Mismo stack: TypeScript, Fastify, Prisma, PostgreSQL.
- Mismo Design System: `packages/ui`, `packages/tokens`.
- Mismas convenciones de API: ver `docs/api/`.

### 4. Cada célula es dueña de sus carpetas

| Célula | Carpetas |
|--------|----------|
| **Alpha** | `modules/core/`, `modules/inventory/`, `database/` |
| **Beta** | `apps/api/`, `modules/iam/`, `modules/crm/` |
| **Gamma** | `apps/web/`, `packages/ui/`, `packages/tokens/` |

**No tocar carpetas de otras células.** Si un cambio las afecta, coordinar con el líder correspondiente.

---

## Estructura del monorepo

```
ZENPLUS/
├── apps/              → Aplicaciones
│   ├── api/           → Backend (Beta: Fastify + Prisma)
│   ├── web/           → Frontend (Gamma: React + Next.js)
│   └── admin/         → Admin interno
├── modules/           → Módulos de dominio
│   ├── core/          → Party, Person, Organization (Alpha)
│   ├── iam/           → User, Role, Permission (Beta)
│   ├── crm/           → Lead, Opportunity, Activity (Beta)
│   └── inventory/     → Asset, Property, Project (Alpha)
├── packages/          → Código compartido
│   ├── ui/            → Componentes (Gamma)
│   ├── tokens/        → Colores, tipografía
│   └── shared/        → Tipos compartidos
├── database/          → Migraciones y seeds
├── docs/              → Documentación
│   ├── api/           → Contratos
│   ├── reports/       → Reportes de sprint
│   ├── security/      → Baseline
│   └── adr/           → Decisiones
└── .github/           → CI/CD
```

## Células

| Célula | Alcance | Carpetas |
|--------|---------|----------|
| Alpha | Inventory + Data | `modules/core`, `modules/inventory`, `database` |
| Beta | Platform + CRM | `apps/api`, `modules/iam`, `modules/crm` |
| Gamma | Web + Frontend | `apps/web`, `packages/ui`, `packages/tokens` |

## Cómo contribuir

```bash
# 1. Clonar
git clone https://github.com/Sthefano22/ZENPLUS.git
cd ZENPLUS

# 2. Crear branch con ID del ticket
git checkout -b feature/alpha-inventory-assets
# o
git checkout -b feature/gamma-web-home
# o
git checkout -b feature/beta-crm-opportunity

# 3. Trabajar SOLO en tus carpetas asignadas
# 4. Commit
git add .
git commit -m "feat(alpha): initial inventory module"

# 5. Push
git push origin feature/alpha-inventory-assets

# 6. Abrir Pull Request en GitHub
```

## Cómo levantar el backend (Beta)

```bash
cd apps/api
npm install
cp .env.example .env
# Editar .env con DATABASE_URL de Neon (solicitar al líder)
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

El servidor corre en `http://localhost:3000`.

## Cómo correr tests

```bash
cd apps/api
npm test
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| GET | /health/db | No | DB health |
| POST | /public/leads | No | Lead intake desde Web |
| GET | /crm/leads/me | JWT | My Leads |
| POST | /crm/leads/:id/contact | JWT | Registrar contacto |
| POST | /crm/leads/:id/qualify | JWT | Convertir a Opportunity |
| GET | /crm/opportunities | JWT | Listar Opportunities |
| GET | /crm/opportunities/:id | JWT | Detalle de Opportunity |
| GET | /crm/pipeline | JWT | Pipeline por stage |
| PATCH | /crm/opportunities/:id/stage | JWT | Cambiar stage |

Contratos completos en `docs/api/`.

## Documentación

- `docs/api/` — Contratos de API
- `docs/reports/` — Reportes de sprint y handover
- `docs/security/` — Baseline de seguridad
- `docs/adr/` — Decisiones de arquitectura

## Repositorio

https://github.com/Sthefano22/ZENPLUS

## ZENPLUS Digital Lab

Construimos bienestar, creamos patrimonio.
