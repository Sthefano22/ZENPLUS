'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getFunnelComercial, getKPIsDireccion, getSourceKPI } from '@/lib/api-dashboard'
import { operacionesPorZona } from '@/lib/mock-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import FunnelChart from '@/components/dashboard/FunnelChart'
import KPICard from '@/components/dashboard/KPICard'
import MiniBarChart from '@/components/dashboard/MiniBarChart'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import StaleDataBadge from '@/components/dashboard/StaleDataBadge'
import { frescuraGlobal } from '@/components/dashboard/kpiBuilders'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function DashboardResumenPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const deps = [filters.periodo, filters.zona, filters.fuente, filters.asesorId]

  const kpis = useDashboardQuery(() => getKPIsDireccion(filters), deps)
  const funnel = useDashboardQuery(() => getFunnelComercial(filters), deps)
  const fuentes = useDashboardQuery(() => getSourceKPI(filters), deps)

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'resumen' })
  }, [])

  const global = frescuraGlobal([...(kpis.data ?? []), funnel.data, fuentes.data])
  const topFuentes = [...(fuentes.data?.fuentes ?? [])]
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 3)
    .map((f) => ({ label: f.fuente, valor: f.leads }))

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        as="h1"
        titulo="Resumen ejecutivo"
        descripcion="Métricas clave de Dirección: todos los asesores y todas las zonas."
        accion={global && <StaleDataBadge isStale={global.isStale} lastUpdated={global.lastUpdated} />}
      />

      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <section aria-label="Indicadores clave">
        <QueryState
          loading={kpis.loading}
          error={kpis.error}
          onRetry={kpis.retry}
          isEmpty={!kpis.data || kpis.data.length === 0}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {kpis.data?.map((k) => <KPICard key={k.id} kpi={k} />)}
          </div>
        </QueryState>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader titulo="Funnel Comercial" descripcion="De lead a operación cerrada en el periodo seleccionado." />
        <QueryState loading={funnel.loading} error={funnel.error} onRetry={funnel.retry} isEmpty={!funnel.data}>
          {funnel.data && <FunnelChart funnel={funnel.data} />}
        </QueryState>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QueryState
          loading={fuentes.loading}
          error={fuentes.error}
          onRetry={fuentes.retry}
          isEmpty={topFuentes.length === 0}
          rows={1}
        >
          <MiniBarChart titulo="Leads por fuente (top 3)" datos={topFuentes} unidad="leads" />
        </QueryState>
        <MiniBarChart titulo="Operaciones por zona" datos={operacionesPorZona} unidad="operaciones" colorClass="fill-secondary" />
      </section>
    </div>
  )
}
