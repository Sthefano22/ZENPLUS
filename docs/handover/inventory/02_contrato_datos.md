# ZENPLUS — Contrato de Datos

## Asset

Entidad principal administrada por Inventory.

| Campo | Descripción |
|---|---|
| id | Identificador único |
| code | Código único |
| name | Nombre |
| description | Descripción |
| assetType | Tipo de activo |
| status | Estado del activo |
| areaM2 | Área |
| currency | Moneda |
| currentPrice | Precio actual |
| ownerPartyId | Propietario, cuando corresponde |
| createdAt | Fecha de creación |
| updatedAt | Fecha de actualización |

## Tipos de activo

- LOT
- APARTMENT
- HOUSE
- COMMERCIAL_SPACE

## Estados

- DRAFT
- UNDER_REVIEW
- IN_REVIEW
- AVAILABLE
- RESERVED
- SOLD

## Requirement

Beta utiliza:

- operationType
- assetType
- zones
- budgetMin
- budgetMax
- currency
- areaMin
- areaMax
- attributes
- timeHorizon

Actualmente el servicio de búsqueda utiliza principalmente status, assetType y rango de currentPrice.

Los criterios adicionales requieren definición del matching correspondiente.

## Project / Unit

Existe la relación:

Project → Unit

No existe actualmente una relación directa:

Asset → Unit

ni:

Asset → Project.

## Reglas

Los consumidores no deben modificar directamente estados críticos de Inventory. Las operaciones sensibles deben ejecutarse mediante mecanismos server-side y transaccionales.
