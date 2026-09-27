# Handover & Evidence Pack — Célula Alpha (Fase 2)

**Fase:** Fase 2 · Commercial Engine  
**Célula:** Alpha (Inventory, Core Data & Availability)  
**Tickets abordados:** ALP2-005, ALP2-006, ALP2-007, ALP2-008, ALP2-009, ALP2-010  
**Fecha:** 2026-09-26  
**Estado:** LISTO PARA REVIEW / EXIT GATE GO  

---

## 1. Resumen Ejecutivo
La célula Alpha ha completado el paquete de ingeniería asignado para la Fase 2, garantizando la consistencia y atomicidad del inventario frente a las operaciones comerciales (visitas, ofertas y reservas). Se protegió el sistema frente a *double booking*, se crearon endpoints de disponibilidad agregada para proyectos y unidades, se optimizaron índices de búsqueda de candidatos, se implementó el registro de eventos de dominio y se pobló el dataset sintético para el motor comercial en Neon PostgreSQL.

---

## 2. Detalle de Entregables por Ticket

### ALP2-005: Protección contra Doble Disponibilidad (Must)
* **Mecanismo:** Implementación de transacción ACID con bloqueo pesimista de fila (`SELECT ... FOR UPDATE`) sobre la tabla de activos.
* **Control de Hold:** Verificación obligatoria de `asset_active_hold` no expirado. Si el activo está ocupado o en hold activo, la transacción aborta con `409 Conflict`.
* **Prueba de Concurrencia:** Se ejecutó una prueba de estrés simulando 5 solicitudes concurrentes en paralelo sobre el mismo activo. Exactamente 1 solicitud adquirió el hold (HTTP 201) y las 4 restantes fueron rechazadas con conflicto (HTTP 409).

### ALP2-006: Project/Unit Availability Aggregation (Should)
* **Endpoint:** `GET /api/projects`
* **Cálculo:** Agregación en tiempo real de unidades totales, unidades disponibles (excluyendo holds activos no expirados), unidades reservadas, unidades vendidas, rango de precios (`minPrice`, `maxPrice`) y porcentaje de disponibilidad del proyecto.

### ALP2-007: Candidate-Search Indexes (Should)
* **Migración:** `database/fase2_alpha_indexes_events.sql`
* **Índices aplicados en Neon DB:**
  * `idx_assets_commercial_search` sobre `(commercial_status, price, area)`
  * `idx_assets_project_lookup` sobre `(project_id)`
  * `idx_assets_publication_active` sobre `(publication_status, commercial_status)`
  * `idx_active_hold_expires` sobre `(expires_at)`

### ALP2-008: Domain Events de Inventory (Must)
* **Tabla de Eventos:** `public.inventory_domain_events`
* **Eventos emitidos:** `asset_availability_changed` generado de forma atómica dentro de la transacción de reserva con payload JSON trazable (actor, identificador de reserva, expiración del hold y timestamps).

### ALP2-009: Seeds Commercial Engine (Must)
* **Script:** `database/seeds/002_commercial_engine_seeds.js`
* **Dataset generado en Neon DB:**
  * 2 Proyectos (`PRJ-MIRA-01` Torre Zen Miraflores y `PRJ-CIEN-02` Condominio Campestre Las Lomas).
  * 9 Activos y unidades inmobiliarias con precios vigentes, áreas, proyectos vinculados y estados comerciales diversificados (`AVAILABLE`, `RESERVED`, `SOLD`).

### ALP2-010: Hardening y Handover (Must)
* Suite de verificación automatizada: `scratch/test_concurrency_and_aggregation.js`.
* Sin errores de sintaxis ni fugas de conexiones en el pool de PostgreSQL.

---

## 3. Matriz de Evidencia de Pruebas

| Prueba | Componente | Criterio de Aceptación | Resultado |
|---|---|---|---|
| Concurrencia Double Booking | `app/api/assets/route.ts` | 1 éxito, N conflictos 409 | ✅ PASSED (1 éxito / 4 conflictos) |
| Agregación Proyectos | `app/api/projects/route.ts` | Conteo dinámico y precios por proyecto | ✅ PASSED (2 proyectos calculados) |
| Índices de Búsqueda | PostgreSQL Neon | Existencia y uso en plan de consulta | ✅ PASSED (5 índices verificados) |
| Emisión Eventos | `inventory_domain_events` | Registro atómico con payload | ✅ PASSED (Evento registrado) |
| Seeds Sintéticos | Neon DB | Carga limpia y reproducible | ✅ PASSED (2 proyectos, 9 unidades) |
