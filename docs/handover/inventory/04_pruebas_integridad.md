# ZENPLUS — Pruebas de Integridad

## Foreign Key Project → Unit

Restricción:

units_project_id_fkey

Se intentó insertar una Unit utilizando un project_id inexistente.

Resultado:

SQLSTATE 23503

violates foreign key constraint "units_project_id_fkey"

## Resultado

PRUEBA SUPERADA.

PostgreSQL impide registrar una Unit que referencia un Project inexistente.

## Restricciones revisadas

- Primary Keys
- Unique constraints
- NOT NULL
- Foreign Keys
- Restricciones de integridad de las tablas principales de Inventory
