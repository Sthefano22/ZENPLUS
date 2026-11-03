'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getFunnelComercial } from '@/lib/api-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import DataTable from '@/components/dashboard/DataTable'
import FunnelChart from '@/components/dashboard/FunnelChart'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { ETIQUETA_PERIODO, formatNumero } from '@/components/dashboard/format'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function FunnelPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const funnel = useDashboardQuery(
    () => getFunnelComercial(filters),
    [filters.periodo, filters.zona, filters.fuente, filters.asesorId]
  )

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'funnel' })
  }, [])

  const filas =
    funnel.data?.etapas.map((e, i, todas) => ({
      etapa: e.etapa,
      cantidad: formatNumero(e.cantidad),
      porcentaje: `${e.porcentaje}%`,
      desdeAnterior: i === 0 ? '—' : `${formatNumero((e.cantidad / todas[i - 1].cantidad) * 100)}%`,
    })) ?? []

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h1"
        titulo="Funnel Comercial"
        descripcion="Lead hasta Operación cerrada. Numerador y denominador visibles."
      />
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <QueryState loading={funnel.loading} error={funnel.error} onRetry={funnel.retry} isEmpty={!funnel.data} rows={3}>
        {funnel.data && (
          <>
            <FunnelChart funnel={funnel.data} />
            <DataTable
              ariaLabel="Detalle del funnel comercial por etapa"
              columnas={[
                { key: 'etapa', label: 'Etapa' },
                { key: 'cantidad', label: 'Cantidad', align: 'right' },
                { key: 'porcentaje', label: '% del total', align: 'right' },
                { key: 'desdeAnterior', label: '% conversión desde etapa anterior', align: 'right' },
              ]}
              filas={filas}
            />
            <p className="font-hanken text-xs text-on-surface-variant">
              Los porcentajes muestran la conversión acumulada desde Leads. Periodo: {ETIQUETA_PERIODO[funnel.data.periodo]}.
              Fuente: CRM Beta.
            </p>
          </>
        )}
      </QueryState>
    </div>
  )
}
