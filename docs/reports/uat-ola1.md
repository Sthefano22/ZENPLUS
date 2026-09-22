# UAT - Ola 1 (User Acceptance Testing)

## Información
- **Fecha:** 2026-09-22
- **Responsable:** Sthefano22 (Líder ZENPLUS)
- **Ambiente:** Development (local + Neon)
- **Versión:** v1.0.0-ola1

## Casos de prueba

### 1. Autenticación

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 1.1 | Registro de usuario | POST /auth/register con email/password/fullName/role | 201 + usuario creado | ✅ |
| 1.2 | Login exitoso | POST /auth/login con credenciales válidas | 200 + token JWT | ✅ |
| 1.3 | Login fallido | POST /auth/login con password incorrecto | 401 + error | ✅ |
| 1.4 | /auth/me con token válido | GET /auth/me con Bearer token | 200 + datos del usuario | ✅ |
| 1.5 | /auth/me sin token | GET /auth/me sin Authorization | 401 UNAUTHORIZED | ✅ |

### 2. Inventario (Assets)

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 2.1 | Listar assets públicos | GET /public/assets | 200 + array de assets AVAILABLE | ✅ |
| 2.2 | Ver detalle de asset | GET /public/assets/:id | 200 + asset con timeline | ✅ |
| 2.3 | Crear asset como ADMIN | POST /assets con JWT ADMIN | 201 + asset en DRAFT | ✅ |
| 2.4 | Crear asset como ADVISOR | POST /assets con JWT ADVISOR | 403 FORBIDDEN | ✅ |
| 2.5 | Cambiar estado de asset | PATCH /assets/:id/status con JWT ADMIN | 200 + nuevo estado | ✅ |
| 2.6 | Ver timeline | GET /assets/:id/timeline | 200 + historial de cambios | ✅ |

### 3. Proyectos + Unidades

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 3.1 | Listar proyectos públicos | GET /public/projects | 200 + array de proyectos | ✅ |
| 3.2 | Ver detalle de proyecto | GET /public/projects/:id | 200 + proyecto con units | ✅ |
| 3.3 | Crear proyecto como ADMIN | POST /projects con JWT ADMIN | 201 + proyecto creado | ✅ |
| 3.4 | Crear unidad | POST /projects/:id/units | 201 + unidad creada | ✅ |

### 4. CRM

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 4.1 | Crear Lead público | POST /public/leads | 201 + Lead ASSIGNED | ✅ |
| 4.2 | Listar mis leads | GET /crm/leads/me con JWT | 200 + array de leads | ✅ |
| 4.3 | Contactar Lead | POST /crm/leads/:id/contact | 200 + Lead CONTACTED | ✅ |
| 4.4 | Calificar Lead | POST /crm/leads/:id/qualify | 200 + Opportunity creada | ✅ |
| 4.5 | Listar Opportunities | GET /crm/opportunities | 200 + array | ✅ |
| 4.6 | Ver pipeline | GET /crm/pipeline | 200 + conteo por stage | ✅ |
| 4.7 | Cambiar stage | PATCH /crm/opportunities/:id/stage | 200 + nuevo stage | ✅ |

### 5. Web (Gamma)

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 5.1 | Home carga | Abrir http://localhost:3001 | Página con propiedades | ✅ |
| 5.2 | Búsqueda funciona | Abrir /buscar | Assets reales de Alpha | ✅ |
| 5.3 | Ficha de propiedad | Abrir /propiedad/:slug | Detalle del asset real | ✅ |
| 5.4 | Login real | Llenar formulario en /login | JWT en cookie + redirect | ✅ |
| 5.5 | Formulario crea Lead | Llenar form en ficha | Lead en crm.lead | ✅ |

### 6. Golden E2E (flujo completo)

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 6.1 | Asset → Web | Crear asset, verlo en /buscar | Asset visible | ✅ |
| 6.2 | Web → Lead | Llenar formulario | Lead creado en CRM | ✅ |
| 6.3 | Lead → Opportunity | Calificar Lead | Opportunity creada | ✅ |
| 6.4 | Pipeline actualizado | GET /crm/pipeline | Oportunidad contada | ✅ |
| 6.5 | E2E automatizado | npm test | 22 tests passing | ✅ |

### 7. Observabilidad

| # | Caso | Pasos | Resultado esperado | Estado |
|---|------|-------|-------------------|--------|
| 7.1 | Health check | GET /health | 200 + status ok | ✅ |
| 7.2 | DB health | GET /health/db | 200 + db connected | ✅ |
| 7.3 | Métricas | GET /metrics | 200 + métricas | ✅ |
| 7.4 | Feature flags | GET /flags | 200 + flags activos | ✅ |

## Resumen

| Categoría | Casos | Pasados | % |
|-----------|-------|---------|---|
| Autenticación | 5 | 5 | 100% |
| Inventario | 6 | 6 | 100% |
| Proyectos | 4 | 4 | 100% |
| CRM | 7 | 7 | 100% |
| Web | 5 | 5 | 100% |
| Golden E2E | 5 | 5 | 100% |
| Observabilidad | 4 | 4 | 100% |
| **Total** | **36** | **36** | **100%** |

## Defectos encontrados

**Ninguno crítico.**

Defectos menores documentados para Ola 2:
- Imagen placeholder en fichas (usar imagen real del Asset)
- Xenia hub pendiente
- SEO técnico P0 pendiente
- Accesibilidad P0 pendiente

## Aprobación

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| QA Lead | Sthefano22 | 2026-09-22 | ✅ |
| Líder ZENPLUS | Sthefano22 | 2026-09-22 | ✅ |
| Dirección | Pendiente | — | — |

## Resultado

**APROBADO** ✅

La Ola 1 cumple los criterios de aceptación de usuario.