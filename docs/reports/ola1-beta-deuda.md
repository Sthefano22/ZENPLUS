# Deuda Técnica - Beta - Ola 1

## Pendiente para Ola 2

| # | Item | Prioridad | Responsable |
|---|------|-----------|-------------|
| 1 | IAM real (login + JWT firmado) | Alta | Beta + Gamma |
| 2 | AuthZ / Data Scope | Alta | Beta |
| 3 | Golden E2E automatizado | Alta | QA |
| 4 | UAT | Alta | QA + Dirección |
| 5 | Security Verification | Alta | Security |
| 6 | Threat model Ola 1 | Alta | Security |
| 7 | Observabilidad completa (métricas) | Media | Beta |
| 8 | Feature flags | Media | Beta |
| 9 | Rate limiting en /public/leads | Media | Beta |
| 10 | RC pipeline | Media | Beta |

## Riesgos conocidos

- Sin IAM real, cualquier usuario puede llamar endpoints JWT con token de prueba.
- Sin rate limiting, /public/leads puede ser abusado.
- Sin UAT, no hay validación de usuario final.
- Sin Security Verification, no hay garantía de controles.
- Sin feature flags, no hay manera de activar/desactivar funcionalidades sin deploy.