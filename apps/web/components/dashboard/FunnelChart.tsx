import type { FunnelComercial } from '@/types'
import StaleDataBadge from './StaleDataBadge'
import { formatNumero } from './format'

// El campo `color` del mock es un nombre de token; las clases van literales aquí para que Tailwind las genere.
const FILL: Record<string, string> = {
  primary: 'fill-primary',
  secondary: 'fill-secondary',
}

export default function FunnelChart({ funnel }: { funnel: FunnelComercial }) {
  const resumen = funnel.etapas.map((e) => `${e.etapa}: ${formatNumero(e.cantidad)} (${e.porcentaje}%)`).join('; ')

  return (
    <figure
      aria-label={`Funnel comercial. ${resumen}. Conversión total ${funnel.tasaConversionTotal}%.`}
      className="rounded-xl border border-outline-variant bg-surface-low p-5"
    >
      <ol className="flex flex-col">
        {funnel.etapas.map((etapa, i) => {
          const anterior = i > 0 ? funnel.etapas[i - 1] : null
          const pasa = anterior && anterior.cantidad > 0 ? (etapa.cantidad / anterior.cantidad) * 100 : null
          return (
            <li key={etapa.etapa}>
              {pasa !== null && (
                <p className="py-1.5 font-hanken text-xs text-on-surface-variant md:pl-[12rem]">
                  <span aria-hidden="true">↓ </span>
                  {formatNumero(pasa)}% pasa a la siguiente etapa
                </p>
              )}
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[11rem_1fr] md:gap-4">
                <div>
                  <p className="font-syne text-sm font-semibold text-on-surface">{etapa.etapa}</p>
                  <p className="font-hanken text-xs text-on-surface-variant">
                    {formatNumero(etapa.cantidad)} · {etapa.porcentaje}% del total
                  </p>
                </div>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  className="h-6 w-full"
                >
                  <rect x="0" y="0" width="100" height="10" className="fill-surface-high" />
                  <rect
                    x="0"
                    y="0"
                    width={Math.max(etapa.porcentaje, 1.5)}
                    height="10"
                    className={`${FILL[etapa.color] ?? 'fill-primary'} stroke-outline`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </li>
          )
        })}
      </ol>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-3">
        <span className="font-hanken text-xs text-on-surface-variant">
          Conversión total lead → operación: {funnel.tasaConversionTotal}%
        </span>
        <StaleDataBadge isStale={funnel.isStale} lastUpdated={funnel.lastUpdated} />
      </figcaption>
    </figure>
  )
}
