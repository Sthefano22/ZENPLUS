import {opportunities, requirements, visitas, ofertaThreads, reservas, timelinePorOpportunity} from '@/lib/mock-commercial'
import type {Opportunity, Requirement, Visita, OfertaThread, OfertaVersion, Reserva, TimelineEvento} from '@/types'

const USE_COMMERCIAL_API = process.env.NEXT_PUBLIC_USE_COMMERCIAL_API === 'true'
const BETA_COMMERCIAL_API_URL = process.env.NEXT_PUBLIC_BETA_COMMERCIAL_API_URL ?? ''

async function fetchBeta<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BETA_COMMERCIAL_API_URL}${path}`, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function getOpportunities(): Promise<Opportunity[]> {
  if (USE_COMMERCIAL_API) {
    const data = await fetchBeta<Opportunity[]>('/opportunities')
    return data ?? []
  }
  return delay(opportunities)
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  if (USE_COMMERCIAL_API) {
    return fetchBeta<Opportunity>(`/opportunities/${id}`)
  }
  return delay(opportunities.find((o) => o.id === id) ?? null)
}

export async function getRequirement(opportunityId: string): Promise<Requirement | null> {
  if (USE_COMMERCIAL_API) {
    return fetchBeta<Requirement>(`/opportunities/${opportunityId}/requirement`)
  }
  return delay(requirements.find((r) => r.opportunityId === opportunityId) ?? null)
}

export async function updateRequirement(
  opportunityId: string,
  data: Partial<Requirement>
): Promise<{ ok: boolean }> {
  if (USE_COMMERCIAL_API) {
    const res = await fetchBeta<{ ok: boolean }>(`/opportunities/${opportunityId}/requirement`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res ?? { ok: false }
  }

  const ahora = new Date().toISOString()
  const existente = requirements.find((r) => r.opportunityId === opportunityId)
  if (existente) {
    Object.assign(existente, data, { actualizadoEn: ahora })
  } else {
    requirements.push({
      id: generarId('req'),
      opportunityId,
      operacion: data.operacion ?? 'venta',
      tipos: data.tipos ?? [],
      distritos: data.distritos ?? [],
      presupuestoMin: data.presupuestoMin,
      presupuestoMax: data.presupuestoMax,
      areaMinM2: data.areaMinM2,
      dormitoriosMin: data.dormitoriosMin,
      notas: data.notas,
      actualizadoEn: ahora,
    })
  }
  return delay({ ok: true })
}

export async function getVisitas(opportunityId: string): Promise<Visita[]> {
  if (USE_COMMERCIAL_API) {
    const data = await fetchBeta<Visita[]>(`/opportunities/${opportunityId}/visits`)
    return data ?? []
  }
  return delay(visitas.filter((v) => v.opportunityId === opportunityId))
}

export async function createVisita(data: Omit<Visita, 'id'>): Promise<{ ok: boolean; id?: string }> {
  if (USE_COMMERCIAL_API) {
    const res = await fetchBeta<{ ok: boolean; id?: string }>(`/opportunities/${data.opportunityId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res ?? { ok: false }
  }

  const id = generarId('visita')
  visitas.push({ ...data, id })
  return delay({ ok: true, id })
}

export async function updateVisita(id: string, data: Partial<Visita>): Promise<{ ok: boolean }> {
  if (USE_COMMERCIAL_API) {
    const res = await fetchBeta<{ ok: boolean }>(`/visits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res ?? { ok: false }
  }

  const visita = visitas.find((v) => v.id === id)
  if (!visita) return delay({ ok: false })
  Object.assign(visita, data)
  return delay({ ok: true })
}

export async function getOfertaThread(opportunityId: string): Promise<OfertaThread | null> {
  if (USE_COMMERCIAL_API) {
    return fetchBeta<OfertaThread>(`/opportunities/${opportunityId}/offer-thread`)
  }
  return delay(ofertaThreads.find((o) => o.opportunityId === opportunityId) ?? null)
}

/**
 * No listada explícitamente en el punto GAM2 original, pero necesaria para que
 * OfertaVersionForm (Tarea 7) pueda persistir una nueva versión de oferta.
 * Ver nota de desviación en el reporte de la Tarea 2.
 */
export async function createOfertaVersion(
  opportunityId: string,
  data: Omit<OfertaVersion, 'version'>
): Promise<{ ok: boolean }> {
  if (USE_COMMERCIAL_API) {
    const res = await fetchBeta<{ ok: boolean }>(`/opportunities/${opportunityId}/offer-versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res ?? { ok: false }
  }

  const thread = ofertaThreads.find((o) => o.opportunityId === opportunityId)
  if (!thread) return delay({ ok: false })
  const version = thread.versiones.length + 1
  thread.versiones.push({ ...data, version })
  thread.actualizadoEn = data.creadoEn
  return delay({ ok: true })
}

export async function createReserva(
  data: Omit<Reserva, 'id'>
): Promise<{ ok: boolean; id?: string; conflicto?: boolean }> {
  if (USE_COMMERCIAL_API) {
    const res = await fetchBeta<{ ok: boolean; id?: string; conflicto?: boolean }>(
      `/opportunities/${data.opportunityId}/reservations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    )
    return res ?? { ok: false }
  }

  const yaReservada = reservas.some((r) => r.propiedadSlug === data.propiedadSlug && r.estado === 'Activa')
  if (yaReservada) return delay({ ok: false, conflicto: true })

  const id = generarId('reserva')
  reservas.push({ ...data, id })
  return delay({ ok: true, id })
}

/**
 * No listada explícitamente en el punto GAM2 original, pero necesaria para que
 * ReservaPanel (Tarea 8) pueda leer la reserva activa de una opportunity.
 * Ver nota de desviación en el reporte de la Tarea 2.
 */
export async function getReserva(opportunityId: string): Promise<Reserva | null> {
  if (USE_COMMERCIAL_API) {
    return fetchBeta<Reserva>(`/opportunities/${opportunityId}/reservations`)
  }
  return delay(reservas.find((r) => r.opportunityId === opportunityId) ?? null)
}

export async function getTimeline(opportunityId: string): Promise<TimelineEvento[]> {
  if (USE_COMMERCIAL_API) {
    const data = await fetchBeta<TimelineEvento[]>(`/opportunities/${opportunityId}/timeline`)
    return data ?? []
  }
  return delay(timelinePorOpportunity[opportunityId] ?? [])
}