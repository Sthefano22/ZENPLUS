# Threat Model - Ola 1

## Activos
- Credenciales de usuarios (JWT)
- PII (nombres, emails, teléfonos)
- Base de datos PostgreSQL
- Código fuente

## Actores
- Usuarios públicos (formularios)
- Asesores (ADVISOR)
- Administradores (ADMIN)
- Atacantes externos

## Superficies de ataque
- `POST /public/leads` (sin auth)
- `POST /auth/login` (sin auth)
- `GET /public/assets` (sin auth)
- `POST /assets` (JWT ADMIN)

## Amenazas
| Amenaza | Probabilidad | Impacto |
|---------|--------------|---------|
| SQL Injection | Baja (Prisma) | Alto |
| XSS | Baja (JSON API) | Medio |
| CSRF | Baja (JWT header) | Medio |
| DDoS / abuse | Media (sin rate limit) | Alto |
| PII leak | Media | Alto |
| JWT theft | Baja | Alto |

## Controles implementados
- Prisma ORM (queries parametrizadas)
- Zod (validación)
- JWT (auth)
- AuthZ por roles
- Rate limiting
- HTTPS en prod
- Secrets fuera del repo

## Acciones pendientes
- Rotación de secretos
- Penetration testing
- WAF