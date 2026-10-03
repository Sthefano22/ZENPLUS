# ZENPLUS — Pendientes de Integración

## 1. Matching Requirement → Asset

Debe definirse cómo los criterios de Requirement determinarán los Assets elegibles.

Criterios:

- operationType
- assetType
- zones
- budgetMin / budgetMax
- currency
- areaMin / areaMax
- attributes
- timeHorizon

## 2. Reservation / Hold

Debe definirse con Reservation cómo se consumirá el mecanismo temporal de hold.

Inventory conserva la responsabilidad sobre la disponibilidad del activo y su protección transaccional.

## 3. Contrato definitivo

Beta/Gamma deben acordar:

- endpoint
- método HTTP
- request
- response
- códigos de error
- autenticación
- reglas de actualización
- comportamiento ante expiración del hold

## 4. Relaciones

No asumir relaciones que actualmente no existen:

Asset → Unit
Asset → Project

La relación actualmente validada es:

Project → Unit.
