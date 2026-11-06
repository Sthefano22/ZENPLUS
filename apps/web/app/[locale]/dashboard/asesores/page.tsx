'use client'

import { useEffect, useState } from 'react'
import type { DashboardFilters } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getAsesoresKPI } from '@/lib/api-dashboard'
import DashboardFiltersBar from '@/components/dashboard/DashboardFiltersBar'
import DataTable from '@/components/dashboard/DataTable'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import StaleDataBadge from '@/components/dashboard/StaleDataBadge'
import { claseConversion, formatNumero } from '@/components/dashboard/format'
import { frescuraGlobal } from '@/components/dashboard/kpiBuilders'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

export default function AsesoresPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ periodo: '30d' })
  const asesores = useDashboardQuery(
    () => getAsesoresKPI(filters),
    [filters.periodo, filters.zona, filters.fuente, filters.asesorId]
  )

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'asesores' })
  }, [])

  const lista = asesores.data ?? []
  const frescura = frescuraGlobal(lista)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        as="h1"
        titulo="Asesores"
        descripcion="Cada asesor ve únicamente sus propios datos. Esta vista de Dirección muestra el equipo completo."
        lastUpdated={frescura?.lastUpdated}
        isStale={frescura?.isStale}
      />
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <QueryState
        loading={asesores.loading}
        error={asesores.error}
        onRetry={asesores.retry}
        isEmpty={lista.length === 0}
        rows={3}
      >
        <DataTable
          ariaLabel="Desempeño por asesor"
          columnas={[
            { key: 'asesor', label: 'Asesor' },
            { key: 'leads', label: 'Leads asignados', align: 'right' },
            { key: 'sinResponder', label: 'Sin responder', align: 'right' },
            { key: 'visitas', label: 'Visitas', align: 'right' },
            { key: 'ofertas', label: 'Ofertas', align: 'right' },
            { key: 'reservas', label: 'Reservas', align: 'right' },
            { key: 'conversion', label: 'Conversión', align: 'right' },
          ]}
          filas={lista.map((a) => ({
            asesor: a.asesorNombre,
            leads: formatNumero(a.leadsAsignados),
            sinResponder:
              a.sinResponder > 5 ? (
                <span className="inline-flex items-center gap-1.5">
                  {a.sinResponder}
                  <span className="rounded-full border border-error px-2 py-0.5 text-xs font-semibold text-error">
                    Sin responder
                  </span>
                </span>
              ) : (
                a.sinResponder
              ),
            visitas: a.visitasProgramadas,
            ofertas: a.ofertasActivas,
            reservas: a.reservasActivas,
            conversion: <span className={`font-semibold ${claseConversion(a.tasaConversion)}`}>{a.tasaConversion}%</span>,
          }))}
        />
        {frescura && <StaleDataBadge className="mt-3" isStale={frescura.isStale} lastUpdated={frescura.lastUpdated} />}
      </QueryState>
    </div>
  )
}
