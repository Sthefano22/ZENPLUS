'use client'

import type { DashboardFilters, PeriodoDashboard } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { FUENTES_MOCK, ZONAS_LIMA } from '@/lib/mock-dashboard'

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: '12m', label: '12 meses' },
]

const SELECT_CLASS =
  'rounded-full border border-outline-variant bg-surface-mid px-4 py-2 font-hanken text-sm text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export default function DashboardFiltersBar({
  filters,
  onChange,
}: {
  filters: DashboardFilters
  onChange: (filters: DashboardFilters) => void
}) {
  function aplicar(siguiente: DashboardFilters) {
    onChange(siguiente)
    trackEvent('dashboard_filter_applied', {
      periodo: siguiente.periodo,
      zona: siguiente.zona ?? 'todas',
      fuente: siguiente.fuente ?? 'todas',
    })
  }

  return (
    <div
      role="group"
      aria-label="Filtros del dashboard"
      className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <label className="flex shrink-0 flex-col gap-1 font-hanken text-xs text-on-surface-variant">
        Periodo
        <select
          value={filters.periodo}
          onChange={(e) => aplicar({ ...filters, periodo: e.target.value as PeriodoDashboard })}
          className={SELECT_CLASS}
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex shrink-0 flex-col gap-1 font-hanken text-xs text-on-surface-variant">
        Zona
        <select
          value={filters.zona ?? ''}
          onChange={(e) => aplicar({ ...filters, zona: e.target.value || undefined })}
          className={SELECT_CLASS}
        >
          <option value="">Todas las zonas</option>
          {ZONAS_LIMA.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </label>
      <label className="flex shrink-0 flex-col gap-1 font-hanken text-xs text-on-surface-variant">
        Fuente
        <select
          value={filters.fuente ?? ''}
          onChange={(e) => aplicar({ ...filters, fuente: e.target.value || undefined })}
          className={SELECT_CLASS}
        >
          <option value="">Todas las fuentes</option>
          {FUENTES_MOCK.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
