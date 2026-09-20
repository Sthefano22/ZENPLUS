# Asset Endpoints - Inventory

Base URL: `http://localhost:3000`

## GET /public/assets

Endpoint público. Query params opcionales: `assetType`, `minPrice`, `maxPrice`.

### Response 200
```json
[
  {
    "id": "f0e9a43b-...",
    "code": "DEP-ZN-101",
    "name": "Departamento 101 - Edificio Vista",
    "description": "Departamento flat de 3 habitaciones",
    "assetType": "APARTMENT",
    "status": "AVAILABLE",
    "areaM2": "85.5",
    "currency": "USD",
    "currentPrice": "95000",
    "parties": {
      "organizations": { "trade_name": "ZENPLUS Desarrollo Inmobiliario" }
    }
  }
]