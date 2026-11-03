import { METRIC_CONTRACTS } from '@/lib/mock-dashboard'
import type { KPICard, PeriodoDashboard } from '@/types'

/** Arma un KPICard a partir de un valor suelto y la frescura de su respuesta agregada. */
export function construirKPI(
  contratoId: string,
  label: string,
  valor: number,
  base: { lastUpdated: string; isStale: boolean; periodo: PeriodoDashboard },
  unidad?: string
): KPICard {
  const metricContract = METRIC_CONTRACTS[contratoId]
  return {
    id: contratoId,
    label,
    valor,
    unidad,
    periodo: base.periodo,
    metricContract: { ...metricContract, lastUpdated: base.lastUpdated, isStale: base.isStale },
    isStale: base.isStale,
    lastUpdated: base.lastUpdated,
  }
}

/** Fecha más antigua y estado stale global de varias respuestas ya cargadas. */
export function frescuraGlobal(items: ({ lastUpdated: string; isStale: boolean } | null | undefined)[]) {
  const cargados = items.filter((i): i is { lastUpdated: string; isStale: boolean } => !!i)
  if (cargados.length === 0) return null
  const masAntigua = cargados.reduce((a, b) => (new Date(a.lastUpdated) <= new Date(b.lastUpdated) ? a : b))
  return { lastUpdated: masAntigua.lastUpdated, isStale: cargados.some((i) => i.isStale) }
}
