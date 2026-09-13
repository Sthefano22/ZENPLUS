# Opportunity & Pipeline Endpoints - Beta

Endpoints del módulo CRM para gestionar Opportunities y visualizar el pipeline comercial.

Base URL local: `http://localhost:3000`

Todos los endpoints requieren JWT en el header:

```
Authorization: Bearer <JWT>
```

---

## GET /crm/opportunities

Lista todas las Opportunities, ordenadas por `updatedAt` descendente.

### Response 200

```json
[
  {
    "id": "cmtzdlnma0005qnsghestoads",
    "leadId": "cmtzdbtuq0001qnsgu0suo09o",
    "stage": "WON",
    "amount": "35000",
    "currency": "PEN",
    "nextAction": null,
    "nextActionAt": null,
    "closedAt": "2026-09-13T05:49:12.629Z",
    "closeReason": null,
    "createdAt": "2026-09-13T05:30:59.411Z",
    "updatedAt": "2026-09-13T05:49:12.632Z",
    "lead": {
      "id": "cmtzdbtuq0001qnsgu0suo09o",
      "fullName": "Juan Perez",
      "email": "juan@example.com",
      "phone": "+51999999999",
      "assignedTo": "advisor-1",
      "assetId": "LOT-ZN-001"
    }
  }
]
```

### Campos de la Opportunity

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string | cuid |
| leadId | string | Referencia al Lead origen |
| stage | enum | NEW, QUALIFIED, VISIT_SCHEDULED, OFFER, RESERVATION, WON, LOST |
| amount | decimal? | Monto estimado |
| currency | string | PEN, USD, etc. |
| nextAction | string? | Próxima acción acordada |
| nextActionAt | datetime? | Fecha de la próxima acción |
| closedAt | datetime? | Se llena cuando stage = WON o LOST |
| closeReason | string? | Motivo del cierre |

---

## GET /crm/opportunities/:id

Detalle completo de una Opportunity, incluyendo Lead, Activities y Party.

### Response 200

```json
{
  "id": "cmtzdlnma0005qnsghestoads",
  "leadId": "cmtzdbtuq0001qnsgu0suo09o",
  "stage": "WON",
  "amount": "35000",
  "currency": "PEN",
  "closedAt": "2026-09-13T05:49:12.629Z",
  "closeReason": null,
  "lead": {
    "id": "cmtzdbtuq0001qnsgu0suo09o",
    "source": "WEB_FORM",
    "status": "QUALIFIED",
    "fullName": "Juan Perez",
    "email": "juan@example.com",
    "phone": "+51999999999",
    "message": "Quiero info del Lote Residencial A-12",
    "assetId": "LOT-ZN-001",
    "partyId": "cmtzdamrm000011z3l7t3kk7n",
    "assignedTo": "advisor-1",
    "slaDueAt": "2026-09-13T07:23:19.903Z",
    "firstContactAt": "2026-09-13T05:30:47.166Z",
    "qualifiedAt": "2026-09-13T05:30:59.645Z",
    "activities": [
      {
        "id": "cmtzdlnz80007qnsgz4e2hevb",
        "type": "NOTE",
        "outcome": "QUALIFIED",
        "notes": "Convertido a Opportunity cmtzdlnma0005qnsghestoads",
        "createdBy": "advisor-1",
        "createdAt": "2026-09-13T05:30:59.876Z"
      },
      {
        "id": "cmtzdldzl0003qnsg03dkour0",
        "type": "CALL",
        "outcome": "CONTACTED",
        "notes": "Cliente interesado",
        "createdBy": "advisor-1",
        "createdAt": "2026-09-13T05:30:46.928Z"
      }
    ],
    "party": {
      "id": "cmtzdamrm000011z3l7t3kk7n",
      "type": "PERSON",
      "email": "demo@example.com",
      "phone": "+51999999999",
      "fullName": "Cliente Demo"
    }
  }
}
```

### Errores

| Código | Significado |
|--------|-------------|
| 404 | OPPORTUNITY_NOT_FOUND |

---

## GET /crm/pipeline

Conteo de Opportunities por stage. Útil para dashboards.

### Response 200

```json
{
  "stages": [
    { "stage": "NEW", "count": 0 },
    { "stage": "QUALIFIED", "count": 0 },
    { "stage": "VISIT_SCHEDULED", "count": 0 },
    { "stage": "OFFER", "count": 0 },
    { "stage": "RESERVATION", "count": 0 },
    { "stage": "WON", "count": 1 },
    { "stage": "LOST", "count": 0 }
  ],
  "total": 1
}
```

---

## PATCH /crm/opportunities/:id/stage

Cambia el stage de una Opportunity. Registra `closedAt` automáticamente al pasar a WON o LOST.

### Request

```json
{
  "stage": "VISIT_SCHEDULED",
  "closeReason": "Cliente no interesado"
}
```

### Campos

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| stage | enum | Si | NEW, QUALIFIED, VISIT_SCHEDULED, OFFER, RESERVATION, WON, LOST |
| closeReason | string | No | max 500, solo al cerrar (WON/LOST) |

### Response 200

```json
{
  "id": "cmtzdlnma0005qnsghestoads",
  "leadId": "cmtzdbtuq0001qnsgu0suo09o",
  "stage": "WON",
  "amount": "35000",
  "currency": "PEN",
  "closedAt": "2026-09-13T05:49:12.629Z",
  "closeReason": null,
  "createdAt": "2026-09-13T05:30:59.411Z",
  "updatedAt": "2026-09-13T05:49:12.632Z"
}
```

### Reglas de negocio

- Al pasar a `WON` o `LOST`, se registra `closedAt` automáticamente.
- Al pasar de WON/LOST a otro stage, `closedAt` vuelve a null.
- Analytics emite:
  - `opportunity_stage_changed` en cada cambio.
  - `opportunity_won` al pasar a WON.
  - `opportunity_lost` al pasar a LOST (con `closeReason`).

### Errores

| Código | Significado |
|--------|-------------|
| 400 | VALIDATION_ERROR - stage inválido |
| 404 | OPPORTUNITY_NOT_FOUND |

---

## Flujo completo del Lead a Opportunity

```
1. POST /public/leads
   → Lead creado, asignado, con SLA

2. POST /crm/leads/:id/contact
   → Activity registrada, Lead pasa a CONTACTED

3. POST /crm/leads/:id/qualify
   → Opportunity creada (stage QUALIFIED)
   → Lead pasa a QUALIFIED

4. PATCH /crm/opportunities/:id/stage
   → Opportunity avanza por el pipeline
   → VISIT_SCHEDULED → OFFER → RESERVATION → WON/LOST

5. GET /crm/pipeline
   → Dashboard del estado comercial
```

---

## Stages del Pipeline

| Stage | Significado |
|-------|-------------|
| NEW | Opportunity recién creada |
| QUALIFIED | Lead calificado, interés confirmado |
| VISIT_SCHEDULED | Visita agendada |
| OFFER | Oferta enviada |
| RESERVATION | Reserva activa |
| WON | Cerrada con éxito |
| LOST | Cerrada sin éxito |

---

## Cómo generar un JWT de prueba

Para development:

```bash
cd apps/api
npx tsx scripts/generate-token.ts
```

Copiar el token y usarlo en el header:

```
Authorization: Bearer <TOKEN>
```

**Nota:** En producción, el JWT vendrá del IAM real (Ola 1 con Gamma).