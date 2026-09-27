# ZENPLUS — Prueba de Concurrencia

## Objetivo

Verificar que dos transacciones no puedan obtener simultáneamente el bloqueo de la misma Unit.

## Mecanismo

SELECT ... FOR UPDATE

## Resultado

La primera transacción obtuvo el bloqueo.

La segunda transacción permaneció esperando mientras el bloqueo estaba activo.

Después del ROLLBACK de la primera transacción, la segunda pudo continuar.

Ambas transacciones finalizaron con ROLLBACK.

## Resultado final

PRUEBA SUPERADA.

El mecanismo de bloqueo pesimista funciona correctamente y la prueba no produjo modificaciones permanentes en los datos.
