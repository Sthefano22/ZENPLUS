'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getSourceKPI } from '@/lib/api-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import DataTable from '@/components/dashboard/DataTable'
import MiniBarChart from '@/components/dashboard/MiniBarChart'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { claseConversion, formatNumero } from '@/components/dashboard/format'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function FuentesPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const fuentes = useDashboardQuery(
    () => getSourceKPI(filters),
    [filters.periodo, filters.zona, filters.fuente, filters.asesorId]
  )

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'fuentes' })
  }, [])

  const data = fuentes.data

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h1"
        titulo="Fuentes"
        descripcion={
          data?.disclaimer ??
          'La atribución es de último clic. Los datos de campañas externas pueden tener hasta 48h de retraso. No usar para decisiones de inversión sin validar con el equipo de Marketing.'
        }
        lastUpdated={data?.lastUpdated}
        isStale={data?.isStale}
      />
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <QueryState
        loading={fuentes.loading}
        error={fuentes.error}
        onRetry={fuentes.retry}
        isEmpty={!data || data.fuentes.length === 0}
        rows={3}
      >
        {data && (
          <>
            <MiniBarChart
              titulo="Leads por fuente"
              datos={data.fuentes.map((f) => ({ label: f.fuente, valor: f.leads }))}
              unidad="leads"
            />
            <DataTable
              ariaLabel="Desempeño por fuente de leads"
              columnas={[
                { key: 'fuente', label: 'Fuente' },
                { key: 'leads', label: 'Leads', align: 'right' },
                { key: 'porcentaje', label: '% del total', align: 'right' },
                { key: 'conversion', label: 'Conversión', align: 'right' },
              ]}
              filas={data.fuentes.map((f) => ({
                fuente: f.fuente,
                leads: formatNumero(f.leads),
                porcentaje: `${f.porcentajeDelTotal}%`,
                conversion: <span className={`font-semibold ${claseConversion(f.conversion)}`}>{f.conversion}%</span>,
              }))}
            />
          </>
        )}
      </QueryState>
    </div>
  )
}
