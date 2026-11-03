import { propiedades } from '@/lib/mock'
import { reservas } from '@/lib/mock-commercial'
import type { Propiedad, Operacion, TipoPropiedad } from '@/types'
import { requestApi, type ApiResult } from '@/lib/api-client'

const USE_COMMERCIAL_API = process.env.NEXT_PUBLIC_USE_COMMERCIAL_API === 'true'
const ALPHA_COMMERCIAL_API_URL = process.env.NEXT_PUBLIC_ALPHA_COMMERCIAL_API_URL ?? ''

export interface InventoryEligibleFilters {
  operacion?: Operacion
  tipos?: TipoPropiedad[]
  distritos?: string[]
  presupuestoMin?: number
  presupuestoMax?: number
  areaMinM2?: number
  dormitoriosMin?: number
}

export interface CandidatePropertySummary {
  id: string
  slug: string
  titulo: string
  distrito: string
  tipo: TipoPropiedad
  operacion: Operacion
  precio: number
  moneda: string
  areaM2: number
  dormitorios: number
  banos: number
  imagen: string
  estadoComercial: 'Disponible' | 'Reservado' | 'En Negociación' | 'Hold'
}

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Obtiene las propiedades candidatas elegibles según los requisitos de la oportunidad
 * (Matching determinístico sobre Inventory verificado de Alpha).
 */
export async function getEligibleCandidateProperties(
  filters: InventoryEligibleFilters
): Promise<ApiResult<CandidatePropertySummary[]>> {
  if (USE_COMMERCIAL_API) {
    const params = new URLSearchParams()
    if (filters.operacion) params.set('operacion', filters.operacion)
    if (filters.tipos?.length) params.set('tipos', filters.tipos.join(','))
    if (filters.distritos?.length) params.set('distritos', filters.distritos.join(','))
    if (filters.presupuestoMin !== undefined) params.set('presupuestoMin', filters.presupuestoMin.toString())
    if (filters.presupuestoMax !== undefined) params.set('presupuestoMax', filters.presupuestoMax.toString())
    if (filters.areaMinM2 !== undefined) params.set('areaMinM2', filters.areaMinM2.toString())
    if (filters.dormitoriosMin !== undefined) params.set('dormitoriosMin', filters.dormitoriosMin.toString())

    return requestApi<CandidatePropertySummary[]>(
      ALPHA_COMMERCIAL_API_URL,
      `/inventory/eligible?${params.toString()}`
    )
  }

  // Filtrado determinístico en mock
  const activasReservas = new Set(
    reservas.filter((r) => r.estado === 'Activa').map((r) => r.propiedadSlug)
  )

  const candidatas: CandidatePropertySummary[] = propiedades
    .filter((p) => {
      if (filters.operacion && p.operacion !== filters.operacion) return false
      if (filters.tipos && filters.tipos.length > 0 && !filters.tipos.includes(p.tipo)) return false
      if (filters.distritos && filters.distritos.length > 0 && !filters.distritos.includes(p.distrito)) {
        return false
      }
      if (filters.presupuestoMin !== undefined && p.precio < filters.presupuestoMin) return false
      if (filters.presupuestoMax !== undefined && p.precio > filters.presupuestoMax) return false
      if (filters.areaMinM2 !== undefined && p.areaM2 < filters.areaMinM2) return false
      if (filters.dormitoriosMin !== undefined && p.dormitorios < filters.dormitoriosMin) return false
      return true
    })
    .map((p) => {
      const estaReservada = activasReservas.has(p.slug)
      let estadoComercial: CandidatePropertySummary['estadoComercial'] = 'Disponible'
      if (estaReservada) estadoComercial = 'Reservado'
      else if (p.estado === 'En Negociación') estadoComercial = 'En Negociación'

      return {
        id: p.id,
        slug: p.slug,
        titulo: p.titulo,
        distrito: p.distrito,
        tipo: p.tipo,
        operacion: p.operacion,
        precio: p.precio,
        moneda: p.moneda,
        areaM2: p.areaM2,
        dormitorios: p.dormitorios,
        banos: p.banos,
        imagen: p.imagen,
        estadoComercial,
      }
    })

  return delay({ ok: true, data: candidatas })
}

/**
 * Consulta el estado comercial en tiempo real de un activo específico
 */
export async function getPropertyCommercialStatus(
  slug: string
): Promise<ApiResult<{ slug: string; estadoComercial: string; disponible: boolean }>> {
  if (USE_COMMERCIAL_API) {
    return requestApi(ALPHA_COMMERCIAL_API_URL, `/inventory/${slug}/status`)
  }

  const activa = reservas.some((r) => r.propiedadSlug === slug && r.estado === 'Activa')
  return delay({
    ok: true,
    data: {
      slug,
      estadoComercial: activa ? 'Reservado' : 'Disponible',
      disponible: !activa,
    },
  })
}
