# QA Plan - Ola 1

## Objetivo
Validar la cadena end-to-end: Inventory → Web → CRM.

## Alcance

### Incluye
- Autenticación (register, login, JWT)
- CRUD de Assets, Projects, Units
- CRM: Lead, Contact, Qualify, Opportunity
- Web: Home, Búsqueda, Ficha, Formulario
- Golden E2E completo
- Observabilidad (health, metrics, flags)

### No incluye (Ola 2)
- Xenia hub
- SEO técnico
- Accesibilidad P0
- Performance
- Multi-idioma

## Estrategia de testing

| Tipo | Herramienta | Cobertura |
|------|-------------|-----------|
| Unit | Vitest | Schemas Zod |
| Integration | Vitest + fetch | Endpoints API |
| E2E | Vitest + fetch | Golden E2E |
| Manual | Navegador | Web UI |
| UAT | Manual | Casos de negocio |

## Tests automatizados

| Archivo | Tests | Estado |
|---------|-------|--------|
| tests/lead.test.ts | 2 | ✅ |
| tests/lead-flow.test.ts | 10 | ✅ |
| tests/opportunity.test.ts | 5 | ✅ |
| tests/golden-e2e.test.ts | 5 | ✅ |
| **Total** | **22** | ✅ |

## Criterios de aceptación

- [x] 100% de tests automatizados pasando
- [x] Sin bugs blocker/critical
- [x] UAT aprobado
- [x] Golden E2E funcionando
- [x] CI en verde

## Resultado

**QA APROBADO** ✅

## Firma

- QA Lead: Sthefano22
- Fecha: 2026-09-22