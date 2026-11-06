'use client'

import { useEffect, useState } from 'react'
import type { XENIAInsight } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { getXENIAInsights } from '@/lib/api-dashboard'
import InsightCard from '@/components/dashboard/InsightCard'
import QueryState from '@/components/dashboard/QueryState'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery'

const CATEGORIAS: { value: 'todas' | XENIAInsight['categoria']; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'asesor', label: 'Asesor' },
  { value: 'mercado', label: 'Mercado' },
]

export default function XeniaPage() {
  const insights = useDashboardQuery(() => getXENIAInsights(), [])
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]['value']>('todas')

  useEffect(() => {
    trackEvent('dashboard_viewed', { seccion: 'xenia' })
  }, [])

  const todos = insights.data ?? []
  const visibles = categoria === 'todas' ? todos : todos.filter((i) => i.categoria === categoria)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader as="h1" titulo="XENIA Insights" descripcion="Hallazgos generados sobre fuentes de datos aprobadas." />

      <div role="group" aria-label="Filtrar por categoría" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIAS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={categoria === c.value}
            onClick={() => setCategoria(c.value)}
            className={`shrink-0 rounded-full border px-4 py-2 font-hanken text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              categoria === c.value
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant bg-surface-mid text-on-surface hover:bg-white/5'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <QueryState
        loading={insights.loading}
        error={insights.error}
        onRetry={insights.retry}
        isEmpty={visibles.length === 0}
        emptyTitle="XENIA está procesando fuentes aprobadas."
        emptyDescription="Cuando haya insights disponibles para esta categoría aparecerán aquí."
        rows={2}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibles.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      </QueryState>
    </div>
  )
}
