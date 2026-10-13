'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getOpportunities } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'
import OpportunityBadge from '@/components/commercial/OpportunityBadge'
import LoadingRows from '@/components/commercial/LoadingRows'
import EmptyState from '@/components/commercial/EmptyState'
import type { Opportunity } from '@/types'

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(fecha))
}

export default function CommercialWorkspacePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    trackEvent('commercial_workspace_viewed')
  }, [])

  useEffect(() => {
    getOpportunities().then((data) => {
      setOpportunities(data)
      setCargando(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <h1 className="font-syne text-3xl font-bold text-on-surface">
        Opportunities{' '}
        <span className="font-hanken text-lg font-normal text-on-surface-variant">({opportunities.length})</span>
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {cargando ? (
          <LoadingRows rows={3} />
        ) : opportunities.length === 0 ? (
          <EmptyState
            titulo="Sin opportunities"
            descripcion="Todavía no hay opportunities asignadas en el workspace."
          />
        ) : (
          opportunities.map((o) => (
            <Link
              key={o.id}
              href={`/commercial/${o.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-low p-5 transition-colors hover:border-outline"
            >
              <div>
                <p className="font-syne text-base font-semibold text-on-surface">{o.codigo}</p>
                <p className="mt-1 font-hanken text-sm text-on-surface-variant">{o.clienteNombre}</p>
                <p className="mt-0.5 font-hanken text-xs text-on-surface-variant">Asesor: {o.asesorNombre}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <OpportunityBadge estado={o.estado} />
                <span className="font-hanken text-xs text-on-surface-variant">{formatearFecha(o.actualizadoEn)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}