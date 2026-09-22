# Security Baseline - Ola 1

## Clasificación de datos

| Clase | Ejemplos | Tratamiento |
|-------|----------|-------------|
| Pública | Descripciones de propiedades, precios | Acceso libre |
| Interna | Comentarios, asignaciones | Acceso por rol |
| Confidencial | Contratos, ofertas | Acceso restringido + auditoría |
| Altamente sensible | DNI, cuentas bancarias | Mínimo privilegio |

## Reglas obligatorias

1. No subir `.env`, passwords, API keys a Git.
2. Las acciones sensibles se validan en backend.
3. Usar datos sintéticos en development.
4. No copiar bases productivas a laptops.
5. Cuentas privilegiadas con MFA (pendiente Ola 2).
6. Hallazgos de seguridad por canales restringidos.
7. Rotación de secretos cada 90 días.

## Inventario de secretos

| Secreto | Ubicación | Owner |
|---------|-----------|-------|
| DATABASE_URL | `.env` local + Neon | Platform |
| JWT_SECRET | `.env` local | Platform |
| Neon credentials | Neon console | Platform |

## Acceso por ambiente

| Ambiente | Estudiante | Líder | Tech Lead |
|----------|------------|-------|-----------|
| Local | ✅ Total | ✅ Total | ✅ Total |
| Development | ⚠️ Técnico | ✅ Gestión | ✅ Admin |
| Staging | ❌ | ⚠️ QA/demo | ✅ Admin |
| Production | ❌ | ❌ | ⚠️ Deploy autorizado |

## Firma

- Security Lead: Sthefano22
- Fecha: 2026-09-22