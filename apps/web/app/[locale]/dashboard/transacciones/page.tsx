'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getTransaccionKPI } from '@/lib/api-dashboard'
import { operacionesPorMes } from '@/lib/mock-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import KPICard from '@/components/dashboard/KPICard'
import MiniBarChart from '@/components/dashboard/MiniBarChart'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { construirKPI } from '@/components/dashboard/kpiBuilders'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function TransaccionesPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const tx = useDashboardQuery(
    () => getTransaccionKPI(filters),
    [filters.periodo, filters.zona, filters.fuente, filters.asesorId]
  )

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'transacciones' })
  }, [])

  const data = tx.data
  const base = data && { lastUpdated: data.lastUpdated, isStale: data.isStale, periodo: data.periodo }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h1"
        titulo="Transacciones"
        descripcion="Operaciones cerradas y en proceso, tiempos de cierre y valor."
        lastUpdated={data?.lastUpdated}
        isStale={data?.isStale}
      />
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <QueryState loading={tx.loading} error={tx.error} onRetry={tx.retry} isEmpty={!data} rows={3}>
        {data && base && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard kpi={construirKPI('tx-totales', 'Operaciones totales', data.operacionesTotales, base)} />
              <KPICard kpi={construirKPI('tx-cerradas', 'Operaciones cerradas', data.operacionesCerradas, base)} />
              <KPICard kpi={construirKPI('tx-en-proceso', 'En proceso', data.operacionesEnProceso, base)} />
              <KPICard
                kpi={construirKPI('tx-tiempo-cierre', 'Tiempo promedio de cierre', data.tiempoPromedioCierreDias, base, 'días')}
              />
            </div>
            <div className="max-w-md">
              <KPICard kpi={construirKPI('tx-valor-total', 'Valor total de operaciones', data.valorTotalUSD, base, 'USD')} />
            </div>
            <MiniBarChart titulo="Operaciones por mes" datos={operacionesPorMes} unidad="operaciones" />
            <p className="font-hanken text-xs text-on-surface-variant">
              Valor total basado en precio de cierre registrado en el sistema.
            </p>
          </>
        )}
      </QueryState>
    </div>
  )
}
