'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getInventarioKPI } from '@/lib/api-dashboard'
import { inventarioPorZona } from '@/lib/mock-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import DataTable from '@/components/dashboard/DataTable'
import KPICard from '@/components/dashboard/KPICard'
import MiniBarChart from '@/components/dashboard/MiniBarChart'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { construirKPI } from '@/components/dashboard/kpiBuilders'
import { formatNumero } from '@/components/dashboard/format'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function InventarioPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const inv = useDashboardQuery(
    () => getInventarioKPI(filters),
    [filters.periodo, filters.zona, filters.fuente, filters.asesorId]
  )

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'inventario' })
  }, [])

  const data = inv.data
  const base = data && { lastUpdated: data.lastUpdated, isStale: data.isStale, periodo: filters.periodo }
  const kpis =
    data && base
      ? [
          construirKPI('activos-disponibles', 'Disponibles', data.disponibles, base),
          construirKPI('inv-reservados', 'Reservados', data.reservados, base),
          construirKPI('inv-negociacion', 'En negociación', data.enNegociacion, base),
          construirKPI('inv-publicados', 'Publicados', data.publicados, base),
        ]
      : []

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h1"
        titulo="Inventario"
        descripcion={
          data
            ? `${formatNumero(data.totalActivos)} activos en total · ${formatNumero(data.consultasUltimos30d)} consultas en 30 días · rotación promedio ${data.rotacionPromedioDias} días.`
            : 'Estado del portafolio de activos.'
        }
        lastUpdated={data?.lastUpdated}
        isStale={data?.isStale}
      />
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <QueryState loading={inv.loading} error={inv.error} onRetry={inv.retry} isEmpty={!data} rows={3}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <KPICard key={k.id} kpi={k} />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-6">
          <MiniBarChart
            titulo="Consultas por zona (30 días)"
            datos={inventarioPorZona.map((z) => ({ label: z.zona, valor: z.consultas }))}
            unidad="consultas"
          />
          <DataTable
            ariaLabel="Rotación de inventario por zona"
            columnas={[
              { key: 'zona', label: 'Zona' },
              { key: 'activos', label: 'Activos', align: 'right' },
              { key: 'consultas', label: 'Consultas 30d', align: 'right' },
              { key: 'rotacion', label: 'Rotación prom.', align: 'right' },
            ]}
            filas={inventarioPorZona.map((z) => ({
              zona: z.zona,
              activos: formatNumero(z.activos),
              consultas: formatNumero(z.consultas),
              rotacion: `${z.rotacionDias} días`,
            }))}
          />
        </div>
      </QueryState>
    </div>
  )
}
