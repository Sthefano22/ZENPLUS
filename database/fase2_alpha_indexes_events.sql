-- ====================================================================
-- FASE 2 · CÉLULA ALPHA
-- TICKET ALP2-007: Candidate-Search Indexes
-- TICKET ALP2-008: Domain Events & Availability Infrastructure
-- ====================================================================

-- 1. ALP2-007: Índices para búsqueda de candidatos comerciales
-- Optimizan filtros por estado comercial, precio, área y proyecto
CREATE INDEX IF NOT EXISTS idx_assets_commercial_search 
ON public.assets (commercial_status, price, area);

CREATE INDEX IF NOT EXISTS idx_assets_project_lookup 
ON public.assets (project_id) 
WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assets_publication_active 
ON public.assets (publication_status, commercial_status);

CREATE INDEX IF NOT EXISTS idx_active_hold_expires 
ON public.asset_active_hold (expires_at);

-- 2. ALP2-008: Tabla de Eventos de Dominio de Inventario (Outbox / Event Log)
-- Registra eventos asíncronos para integración con CRM y Web
CREATE TABLE IF NOT EXISTS public.inventory_domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- 'asset_availability_changed', 'unit_availability_changed', etc.
    aggregate_type VARCHAR(50) NOT NULL DEFAULT 'ASSET', -- 'ASSET' | 'PROJECT' | 'UNIT'
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_inventory_events_aggregate 
ON public.inventory_domain_events (aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_inventory_events_occurred 
ON public.inventory_domain_events (occurred_at DESC);
