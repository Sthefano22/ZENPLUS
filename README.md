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

```text
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
│   └── adr/            → Decisiones
└── .github/           → CI/CD