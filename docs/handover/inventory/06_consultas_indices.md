# ZENPLUS — Consultas e Índices

## Consulta analizada

La búsqueda de activos disponibles considera:

- status = AVAILABLE
- asset_type
- rango de current_price
- ORDER BY current_price ASC

## Resultado EXPLAIN ANALYZE

PostgreSQL utilizó:

idx_assets_status

Posteriormente realizó el ordenamiento por current_price.

## Rendimiento

Los tiempos de ejecución observados fueron inferiores a 1.2 ms con el volumen actual de datos.

## Conclusión

Con el volumen actual no se justifica agregar un índice compuesto adicional.

Índice candidato para una futura reevaluación:

CREATE INDEX idx_assets_matching
ON inventory.assets (status, asset_type, current_price);

Este índice no fue aplicado durante las pruebas.
