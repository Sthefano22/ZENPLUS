# ZENPLUS OS — Coordinación Gamma ↔ Alpha y Beta

Este documento describe qué necesita Gamma de cada célula,
qué entrega Gamma a cada una, y cómo hacer el handover.

---

## Lo que Gamma necesita de Alpha

### Qué es
Alpha maneja el inventario de propiedades y proyectos.
Gamma consume esos datos para mostrarlos en la web pública.

### Qué necesita exactamente

Alpha debe publicar una API REST con estos endpoints:

| Método | Path | Descripción |
|---|---|---|
| GET | /properties | Lista de propiedades con filtros opcionales |
| GET | /properties/{slug} | Detalle de una propiedad por slug |
| GET | /projects | Lista de proyectos |
| GET | /projects/{slug} | Detalle de un proyecto |
| GET | /projects/{slug}/units | Unidades de un proyecto |

### Shape esperado por Gamma

Gamma ya tiene los tipos definidos en types/index.ts.
Alpha debe respetar ese contrato o coordinan los campos que difieran.

Los campos mínimos que Gamma necesita de cada propiedad:
id, slug, titulo, ubicacion, distrito, tipo, operacion,
precio, moneda, areaM2, dormitorios, banos, estado, imagen, destacada

Los campos mínimos de cada proyecto:
id, slug, nombre, descripcion, estado, distrito, precioDesde, moneda, imagen

Los campos mínimos de cada unidad:
id, proyectoSlug, nombre, tipo, areaM2, dormitorios, banos, precio, moneda, estado

### Filtros que Gamma envía como query params
- operacion: 'venta' | 'alquiler'
- tipo: tipo de propiedad
- distrito: nombre del distrito
- precioMin: número
- precioMax: número
- dormitorios: número mínimo
- destacada: boolean

### Cómo activar la integración cuando Alpha esté listo

Gamma solo necesita dos variables de entorno:

NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_ALPHA_API_URL=https://url-de-alpha.com/api

Con eso el código de Gamma switchea automáticamente de mocks a API real.
No hay nada más que tocar del lado de Gamma.

### Cómo coordinarse

Opción A (recomendada): Alpha sube su API a un ambiente compartido
(Development o Staging) y le pasa la URL a Gamma para ponerla en .env.

Opción B: Alpha comparte su colección de Postman o archivo OpenAPI
para que Gamma verifique que los shapes coinciden antes de conectar.

---

## Lo que Gamma necesita de Beta

### Qué es
Beta maneja el CRM donde llegan los leads (consultas de usuarios).
Gamma envía los leads desde los formularios de la web.

### Qué necesita exactamente

Beta debe publicar un endpoint POST que reciba leads:

| Método | Path | Descripción |
|---|---|---|
| POST | /public/leads | Recibir un lead desde la web |

### Payload que Gamma envía

```json
{
  "nombre": "string — requerido",
  "email": "string — requerido",
  "telefono": "string — opcional",
  "mensaje": "string — requerido",
  "propiedadRef": "string — slug de la propiedad, opcional",
  "origen": "string — 'ficha' | 'propietario' | 'web'"
}
```

### Respuesta que espera Gamma de Beta

```json
{ "id": "string" }
```

Con status 200 o 201. Cualquier 4xx o 5xx es manejado
por Gamma mostrando un error al usuario.

### Cómo activar la integración cuando Beta esté listo

Gamma solo necesita una variable de entorno:

BETA_CRM_LEAD_ENDPOINT=https://url-de-beta.com/public/leads

Con eso los leads dejan de ser mock y van al CRM real.

### Cómo coordinarse

Opción A (recomendada): Beta sube su endpoint a Development,
le pasa la URL a Gamma, Gamma la pone en .env y prueba
enviando un lead de prueba desde la ficha de cualquier propiedad.

Opción B: Beta comparte la especificación del endpoint
(campos aceptados, validaciones, respuestas de error)
para verificar que el payload de Gamma coincide.

---

## Puntos que requieren coordinación de los tres equipos

### Design System (Punto 10)
Badge, PropertyCard y Skeleton están actualmente en el repo de Gamma.
Para no duplicar componentes, deben migrarse a un paquete compartido.

Qué se necesita acordar:
- Dónde vive el paquete compartido (repo propio, monorepo, etc.)
- Quién es responsable de mantenerlo
- Cómo lo importan Alpha y Beta

Gamma puede exportar los componentes actuales como punto de partida.

### Tests (Punto 16)
Gamma puede escribir los tests de sus propios validadores y formularios
sin depender de nadie. Lo que requiere coordinación es:
- Acordar el framework de testing (Vitest recomendado para Next.js 14)
- Que DevOps lo integre en el CI/CD pipeline

---

## Resumen de handover

| Qué | De quién | Para quién | Cómo |
|---|---|---|---|
| URL de API de propiedades | Alpha | Gamma | Variable NEXT_PUBLIC_ALPHA_API_URL |
| URL de endpoint de leads | Beta | Gamma | Variable BETA_CRM_LEAD_ENDPOINT |
| Componentes del Design System | Gamma | Alpha + Beta | Exportar desde components/ui/ |
| Tipos TypeScript compartidos | Gamma | Alpha + Beta | Exportar types/index.ts como contrato |
| Colección Postman o OpenAPI | Alpha | Gamma | Compartir por Slack o repo |
| Especificación del endpoint leads | Beta | Gamma | Compartir por Slack o repo |

---

## FASE 2 — Commercial Engine

### Lo que Gamma necesita de Alpha en Fase 2

Alpha debe publicar endpoints de elegibilidad comercial:

| Método | Path | Descripción |
|---|---|---|
| GET | /inventory/eligible | Activos elegibles según filtros de Requirement |
| GET | /inventory/{slug}/status | Estado comercial actual de un activo |

Filtros que Gamma enviará como query params para elegibilidad:
- operacion: 'venta' | 'alquiler'
- tipos: string[] (tipos de propiedad)
- distritos: string[]
- presupuestoMin: número
- presupuestoMax: número
- areaMinM2: número
- dormitoriosMin: número

Nota: estos dos endpoints y el selector de activos candidatos que los consume
(GAM2-003) todavía no están implementados en Gamma — solo se dejó listo el
evento de analytics `candidate_asset_selected` (ver docs/DEUDA.md, D-009).

Cómo activar cuando Alpha esté listo:
NEXT_PUBLIC_USE_COMMERCIAL_API=true
NEXT_PUBLIC_ALPHA_COMMERCIAL_API_URL=https://url-de-alpha.com/api

### Lo que Gamma necesita de Beta en Fase 2

Beta debe publicar los endpoints del Commercial Engine:

| Método | Path | Descripción |
|---|---|---|
| GET | /opportunities | Lista de Opportunities del asesor |
| GET | /opportunities/{id} | Detalle de Opportunity |
| GET | /opportunities/{id}/requirement | Requirement actual |
| PUT | /opportunities/{id}/requirement | Actualizar Requirement |
| GET | /opportunities/{id}/visits | Lista de visitas |
| POST | /opportunities/{id}/visits | Crear visita |
| PATCH | /visits/{id} | Actualizar estado o feedback de visita |
| GET | /opportunities/{id}/offer-thread | Thread de ofertas |
| POST | /opportunities/{id}/offer-versions | Nueva versión de oferta |
| GET | /opportunities/{id}/reservations | Reserva activa de la opportunity |
| POST | /opportunities/{id}/reservations | Crear reserva |
| GET | /opportunities/{id}/timeline | Timeline de eventos |

Nota: la fila GET /opportunities/{id}/reservations no estaba en el listado
original de endpoints, pero Gamma la necesita para que el panel de reserva
(ReservaPanel) pueda mostrar la reserva activa sin depender solo de la
respuesta de un POST. Ver lib/api-commercial.ts (getReserva) y
components/README.md para el detalle de esta desviación.

Payloads que Gamma enviará a Beta:

Crear visita:
{ propiedadSlug, propiedadTitulo, fecha, hora, asesorNombre }

Feedback de visita:
{ feedback, interes, siguienteAccion }

Nueva versión de oferta:
{ monto, moneda, condiciones, creadoEn, creadoPor }

Crear reserva:
{ propiedadSlug, propiedadTitulo, monto, moneda, expiraEn }

Respuestas que espera Gamma:
- Crear visita: { ok: true, id: string } o { ok: false, error: string }
- Crear reserva: { ok: true, id: string } o { ok: false, conflicto: true } o { ok: false, error: string }
- Actualizar: { ok: true } o { ok: false, error: string }

Cómo activar cuando Beta esté listo:
NEXT_PUBLIC_USE_COMMERCIAL_API=true
NEXT_PUBLIC_BETA_COMMERCIAL_API_URL=https://url-de-beta.com/api

### Resumen handover Fase 2

| Qué | De quién | Para quién | Cómo |
|---|---|---|---|
| URL elegibilidad de activos | Alpha | Gamma | Variable NEXT_PUBLIC_ALPHA_COMMERCIAL_API_URL |
| URL Commercial Engine API | Beta | Gamma | Variable NEXT_PUBLIC_BETA_COMMERCIAL_API_URL |
| OpenAPI del Commercial Engine | Beta | Gamma | Compartir por Slack o repo |
| Seeds sintéticos Fase 2 | Alpha | Todos | Dataset para pruebas de integración |
| Confirmación de shapes | Beta + Alpha | Gamma | Revisar contra types/index.ts antes de conectar |