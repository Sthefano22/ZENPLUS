# Threat Model - Ola 1

## Información
- **Sistema:** ZENPLUS OS - Ola 1
- **Fecha:** 2026-09-22
- **Autor:** Sthefano22 (Líder ZENPLUS)
- **Versión:** v1.0.0-ola1

## Activos críticos

| Activo | Clasificación | Impacto si se compromete |
|--------|---------------|--------------------------|
| Credenciales JWT | Confidencial | Alto |
| PII (nombres, emails, teléfonos) | Confidencial | Alto |
| Base de datos PostgreSQL | Confidencial | Alto |
| Código fuente | Interno | Medio |
| Feature flags | Interno | Bajo |
| Logs | Interno | Medio |

## Actores

| Actor | Descripción | Confianza |
|-------|-------------|-----------|
| Usuario público | Visitante de la web | Baja |
| Asesor (ADVISOR) | Usuario autenticado con rol limitado | Media |
| Administrador (ADMIN) | Usuario con permisos elevados | Alta |
| Atacante externo | Sin acceso legítimo | Nula |
| Insider | Usuario legítimo malicioso | Media |

## Superficies de ataque

| # | Endpoint | Auth | Riesgo |
|---|----------|------|--------|
| 1 | POST /public/leads | No | Spam, DDoS |
| 2 | POST /auth/login | No | Fuerza bruta |
| 3 | POST /auth/register | No | Creación masiva de cuentas |
| 4 | GET /public/assets | No | Scraping |
| 5 | GET /public/projects | No | Scraping |
| 6 | POST /assets | JWT ADMIN | Escalada de privilegios |
| 7 | PATCH /assets/:id/status | JWT ADMIN | Manipulación |
| 8 | GET /crm/leads/me | JWT | Data leak |
| 9 | POST /crm/leads/:id/qualify | JWT | Manipulación |

## Amenazas y mitigaciones

| # | Amenaza | Probabilidad | Impacto | Control implementado |
|---|---------|--------------|---------|---------------------|
| 1 | SQL Injection | Baja | Alto | Prisma ORM (queries parametrizadas) |
| 2 | XSS | Baja | Medio | API devuelve JSON, no HTML |
| 3 | CSRF | Baja | Medio | JWT en header (no cookie) |
| 4 | DDoS / abuse | Media | Alto | Rate limiting (100 req/min) |
| 5 | PII leak en logs | Media | Alto | Logs sanitizados |
| 6 | JWT theft | Baja | Alto | HTTPS en prod, expiración 7d |
| 7 | Fuerza bruta login | Media | Medio | bcrypt (10 rounds) |
| 8 | Escalada de privilegios | Baja | Alto | AuthZ por roles |
| 9 | Secrets en Git | Baja | Alto | .gitignore + secret manager |
| 10 | Dependencias vulnerables | Media | Medio | npm audit |

## Acciones pendientes (Ola 2)

- [ ] Rotación de secretos cada 90 días
- [ ] Penetration testing externo
- [ ] WAF en producción
- [ ] MFA para cuentas privilegiadas
- [ ] Auditoría de accesos
- [ ] Encriptación de PII en reposo
- [ ] Revisión de dependencias vulnerables

## Riesgo residual

**BAJO.** Los controles implementados mitigan las amenazas identificadas.

## Firma

- Security Lead: Sthefano22
- Fecha: 2026-09-22