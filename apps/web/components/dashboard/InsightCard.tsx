'use client'

import { useEffect } from 'react'
import type { XENIAInsight } from '@/types'
import { trackEvent } from '@/lib/analytics'
import { formatFecha } from './format'

const CERTEZA = {
  Alto: 'bg-primary text-on-primary',
  Medio: 'border border-primary bg-primary-container text-on-primary-container',
  Exploratorio: 'border border-outline bg-surface-high text-on-surface-variant',
}

export default function InsightCard({ insight }: { insight: XENIAInsight }) {
  useEffect(() => {
    trackEvent('xenia_insight_viewed', {
      id: insight.id,
      categoria: insight.categoria,
      nivelCerteza: insight.nivelCerteza,
    })
  }, [insight.id, insight.categoria, insight.nivelCerteza])

  return (
    <article
      aria-label={`Insight: ${insight.titulo}`}
      className="flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface-mid p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-syne text-base font-semibold text-on-surface">{insight.titulo}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 font-hanken text-xs font-semibold ${CERTEZA[insight.nivelCerteza]}`}
        >
          Certeza: {insight.nivelCerteza}
        </span>
      </div>
      <p className="font-hanken text-sm text-on-surface-variant">{insight.descripcion}</p>
      <dl className="mt-auto grid gap-1 font-hanken text-xs text-on-surface-variant">
        <div className="flex gap-1">
          <dt className="font-semibold">Fuente:</dt>
          <dd>{insight.fuente}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold">Alcance:</dt>
          <dd>{insight.alcance}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold">Generado:</dt>
          <dd>{formatFecha(insight.fechaGenerado)}</dd>
        </div>
      </dl>
      <p className="border-t border-outline-variant pt-3 font-hanken text-xs text-on-surface">
        Este insight está basado en datos agregados aprobados. No constituye una predicción.
      </p>
    </article>
  )
}
