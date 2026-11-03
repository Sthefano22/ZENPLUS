import {
  asesoresKPI,
  dashboardMockFlags,
  funnelComercial,
  inventarioKPI,
  kpisDireccion,
  sourceKPI,
  transaccionKPI,
  xeniaInsights,
} from '@/lib/mock-dashboard'
import type {
  AsesorKPI,
  DashboardFilters,
  FunnelComercial,
  InventarioKPI,
  KPICard,
  SourceKPI,
  TransaccionKPI,
  XENIAInsight,
} from '@/types'

const USE_DASHBOARD_API = process.env.NEXT_PUBLIC_USE_DASHBOARD_API === 'true'
const BETA_DASHBOARD_API_URL = process.env.NEXT_PUBLIC_BETA_DASHBOARD_API_URL ?? ''

/**
 * A diferencia de Fases 1 y 2 (que devuelven null/[] ante un fallo), el dashboard
 * necesita distinguir "sin datos" de "falló la llamada" (GAM4-007), por eso aquí
 * las funciones rechazan con un Error y la UI muestra el estado de error con reintento.
 */
async function fetchBeta<T>(path: string, filters?: DashboardFilters): Promise<T> {
  const params = new URLSearchParams()
  if (filters) {
    params.set('periodo', filters.periodo)
    if (filters.zona) params.set('zona', filters.zona)
    if (filters.asesorId) params.set('asesorId', filters.asesorId)
    if (filters.fuente) params.set('fuente', filters.fuente)
  }
  const query = params.toString()
  const res = await fetch(`${BETA_DASHBOARD_API_URL}${path}${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error(`Analytics API ${path}: ${res.status}`)
  return (await res.json()) as T
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (dashboardMockFlags.simularError) reject(new Error('Falla simulada del mock'))
      else resolve(value)
    }, ms)
  )
}

export async function getKPIsDireccion(filters: DashboardFilters): Promise<KPICard[]> {
  if (USE_DASHBOARD_API) return fetchBeta<KPICard[]>('/analytics/direction/kpis', filters)
  return delay(kpisDireccion.map((k) => ({ ...k, periodo: filters.periodo })))
}

export async function getFunnelComercial(filters: DashboardFilters): Promise<FunnelComercial> {
  if (USE_DASHBOARD_API) return fetchBeta<FunnelComercial>('/analytics/funnel', filters)
  return delay({ ...funnelComercial, periodo: filters.periodo })
}

export async function getInventarioKPI(filters: DashboardFilters): Promise<InventarioKPI> {
  if (USE_DASHBOARD_API) return fetchBeta<InventarioKPI>('/analytics/inventory', filters)
  return delay(inventarioKPI)
}

export async function getAsesoresKPI(filters: DashboardFilters): Promise<AsesorKPI[]> {
  if (USE_DASHBOARD_API) return fetchBeta<AsesorKPI[]>('/analytics/advisors', filters)
  return delay(
    asesoresKPI
      .filter((a) => !filters.asesorId || a.asesorId === filters.asesorId)
      .map((a) => ({ ...a, periodo: filters.periodo }))
  )
}

export async function getTransaccionKPI(filters: DashboardFilters): Promise<TransaccionKPI> {
  if (USE_DASHBOARD_API) return fetchBeta<TransaccionKPI>('/analytics/transactions', filters)
  return delay({ ...transaccionKPI, periodo: filters.periodo })
}

export async function getSourceKPI(filters: DashboardFilters): Promise<SourceKPI> {
  if (USE_DASHBOARD_API) return fetchBeta<SourceKPI>('/analytics/sources', filters)
  return delay({
    ...sourceKPI,
    periodo: filters.periodo,
    fuentes: sourceKPI.fuentes.filter((f) => !filters.fuente || f.fuente === filters.fuente),
  })
}

export async function getXENIAInsights(): Promise<XENIAInsight[]> {
  if (USE_DASHBOARD_API) return fetchBeta<XENIAInsight[]>('/analytics/xenia/insights')
  return delay(xeniaInsights)
}
