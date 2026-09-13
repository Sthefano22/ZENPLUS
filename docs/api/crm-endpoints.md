# CRM Endpoints - Beta

Endpoints del módulo CRM que Beta expone para Gamma y herramientas internas.

Base URL local: `http://localhost:3000`

---

## POST /public/leads

Endpoint público. Lo consume Gamma desde el formulario web.

### Request

```json
{
  "source": "WEB_FORM",
  "fullName": "Juan Perez",
  "email": "juan@example.com",
  "phone": "+51999999999",
  "message": "Quiero info del Lote Residencial A-12",
  "assetId": "LOT-ZN-001"
}
```

### Campos

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| source | enum | Si | WEB_FORM, WHATSAPP, PHONE, REFERRAL, OTHER |
| fullName | string | Si | min 2, max 200 |
| email | string | No | formato email |
| phone | string | No | min 6, max 30 |
| message | string | No | max 2000 |
| assetId | string | No | código del Asset de Alpha |

### Response 201

```json
{
  "id": "cmtzdbtuq0001qnsgu0suo09o",
  "status": "ASSIGNED",
  "assignedTo": "advisor-1",
  "slaDueAt": "2026-09-13T07:23:19.903Z"
}
```

### Reglas de negocio

- Dedupe: si ya existe un Party con ese email o teléfono, se reutiliza.
- Asignación: round-robin entre asesores activos.
- SLA: 2 horas desde la creación.
- Analytics: emite `lead_created` y `lead_assigned`.

### Errores

| Código | Significado |
|--------|-------------|
| 400 | VALIDATION_ERROR - payload inválido |
| 500 | INTERNAL_ERROR - error inesperado |

---

## GET /crm/leads/me

Requiere JWT. Devuelve los Leads asignados al asesor autenticado.

### Headers

```
Authorization: Bearer <JWT>
```

### Response 200

```json
[
  {
    "id": "cmtzdbtuq0001qnsgu0suo09o",
    "source": "WEB_FORM",
    "status": "QUALIFIED",
    "fullName": "Juan Perez",
    "email": "juan@example.com",
    "phone": "+51999999999",
    "partyId": "cmtzdamrm000011z3l7t3kk7n",
    "assignedTo": "advisor-1",
    "slaDueAt": "2026-09-13T07:23:19.903Z",
    "firstContactAt": "2026-09-13T05:30:47.166Z",
    "qualifiedAt": "2026-09-13T05:30:59.411Z",
    "activities": [],
    "opportunity": {},
    "party": {}
  }
]
```

---

## POST /crm/leads/:id/contact

Requiere JWT. Registra un contacto (llamada, email, WhatsApp, etc.) y actualiza el estado del Lead.

### Headers

```
Authorization: Bearer <JWT>
```

### Request

```json
{
  "outcome": "CONTACTED",
  "type": "CALL",
  "notes": "Cliente interesado"
}
```

### Campos

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| outcome | enum | Si | CONTACTED, NO_ANSWER, WRONG_NUMBER, DISQUALIFIED |
| type | enum | Si | CALL, EMAIL, WHATSAPP, MEETING, NOTE |
| notes | string | No | max 2000 |

### Response 200

```json
{
  "lead": {
    "id": "cmtzdbtuq0001qnsgu0suo09o",
    "status": "CONTACTED",
    "firstContactAt": "2026-09-13T05:30:47.166Z"
  },
  "activity": {
    "id": "cmtzdldzl0003qnsg03dkour0",
    "type": "CALL",
    "outcome": "CONTACTED",
    "notes": "Cliente interesado",
    "createdBy": "advisor-1"
  }
}
```

### Reglas de negocio

- Si `outcome = DISQUALIFIED`, el Lead pasa a `DISQUALIFIED`.
- Si `outcome = CONTACTED`, el Lead pasa a `CONTACTED` y se registra `firstContactAt`.
- Analytics: emite `lead_contacted`.

### Errores

| Código | Significado |
|--------|-------------|
| 404 | LEAD_NOT_FOUND |

---

## POST /crm/leads/:id/qualify

Requiere JWT. Convierte un Lead calificado en Opportunity.

### Headers

```
Authorization: Bearer <JWT>
```

### Request

```json
{
  "amount": 35000,
  "currency": "PEN"
}
```

### Response 200

```json
{
  "id": "cmtzdlnma0005qnsghestoads",
  "leadId": "cmtzdbtuq0001qnsgu0suo09o",
  "stage": "QUALIFIED",
  "amount": "35000",
  "currency": "PEN",
  "createdAt": "2026-09-13T05:30:59.411Z"
}
```

### Reglas de negocio

- El Lead pasa a `QUALIFIED` y se registra `qualifiedAt`.
- Se crea una Opportunity con stage `QUALIFIED`.
- Se registra una Activity de tipo `NOTE`.
- Analytics: emite `lead_qualified`.

### Errores

| Código | Significado |
|--------|-------------|
| 404 | LEAD_NOT_FOUND |

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