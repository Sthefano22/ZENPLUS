import { Clock } from 'lucide-react'
import type { KPICard as KPICardData } from '@/types'
import KPITooltip from './KPITooltip'
import { formatNumero, formatUSD, minutosDesde } from './format'

const TENDENCIA = {
  sube: { flecha: '▲', texto: 'En alza', clase: 'text-primary' },
  baja: { flecha: '▼', texto: 'En baja', clase: 'text-error' },
  estable: { flecha: '→', texto: 'Estable', clase: 'text-on-surface-variant' },
}

function formatValor(valor: number | string, unidad?: string): { principal: string; sufijo?: string } {
  if (typeof valor === 'string') return { principal: valor, sufijo: unidad }
  if (unidad === 'USD') return { principal: formatUSD(valor) }
  return { principal: formatNumero(valor), sufijo: unidad }
}

export default function KPICard({ kpi }: { kpi: KPICardData }) {
  const { principal, sufijo } = formatValor(kpi.valor, kpi.unidad)
  const tendencia = kpi.tendencia ? TENDENCIA[kpi.tendencia] : null
  const minutos = minutosDesde(kpi.lastUpdated)

  return (
    <KPITooltip contract={kpi.metricContract}>
      <article
        aria-label={`${kpi.label}: ${principal}${sufijo ? ` ${sufijo}` : ''}`}
        className="flex h-full flex-col gap-2 rounded-xl border border-outline-variant bg-surface-mid p-5"
      >
        <h3 className="font-hanken text-xs text-on-surface-variant">{kpi.label}</h3>
        <p className="font-syne text-3xl font-bold text-on-surface">
          {principal}
          {sufijo && <span className="ml-1 text-base font-medium text-on-surface-variant">{sufijo}</span>}
        </p>
        {tendencia && (
          <p className={`flex items-center gap-1.5 font-hanken text-xs font-semibold ${tendencia.clase}`}>
            <span aria-hidden="true">{tendencia.flecha}</span>
            <span>
              {tendencia.texto}
              {typeof kpi.variacion === 'number' && kpi.variacion !== 0 && (
                <>
                  {' '}
                  · {kpi.variacion > 0 ? '+' : ''}
                  {kpi.variacion}%
                </>
              )}
            </span>
          </p>
        )}
        <div className="mt-auto flex flex-col items-start gap-1 pt-2">
          {kpi.isStale && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-1 font-hanken text-xs font-semibold text-on-primary-container"
            >
              <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              Dato desactualizado
            </span>
          )}
          <span className="font-hanken text-xs text-on-surface-variant">Actualizado hace {minutos} min</span>
        </div>
      </article>
    </KPITooltip>
  )
}
