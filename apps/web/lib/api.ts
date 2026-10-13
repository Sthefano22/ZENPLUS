import { propiedades, proyectos, unidades } from '@/lib/mock'
import type {
  ApiRespuesta,
  ChatSolicitud,
  FiltrosBusqueda,
  FormularioConsulta,
  FormularioPropietario,
  Propiedad,
  PropiedadResumen,
  Proyecto,
  Unidad,
} from '@/types'

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'
const ALPHA_API_URL = process.env.NEXT_PUBLIC_ALPHA_API_URL ?? ''

async function fetchAlpha<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${ALPHA_API_URL}${path}`)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function aResumen(p: Propiedad): PropiedadResumen {
  const { id, slug, titulo, ubicacion, distrito, tipo, operacion, precio, moneda, areaM2, dormitorios, banos, estado, imagen } = p
  return { id, slug, titulo, ubicacion, distrito, tipo, operacion, precio, moneda, areaM2, dormitorios, banos, estado, imagen }
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function getProperties(filtros: FiltrosBusqueda = {}): Promise<PropiedadResumen[]> {
  if (USE_REAL_API) {
    const params = new URLSearchParams()
    if (filtros.operacion) params.set('operacion', filtros.operacion)
    if (filtros.tipo) params.set('tipo', filtros.tipo)
    if (filtros.distrito) params.set('distrito', filtros.distrito)
    if (typeof filtros.precioMin === 'number') params.set('precioMin', String(filtros.precioMin))
    if (typeof filtros.precioMax === 'number') params.set('precioMax', String(filtros.precioMax))
    if (typeof filtros.dormitorios === 'number') params.set('dormitorios', String(filtros.dormitorios))
    const query = params.toString()
    const data = await fetchAlpha<PropiedadResumen[]>(`/properties${query ? `?${query}` : ''}`)
    return data ?? []
  }

  let resultado = propiedades
  if (filtros.operacion) resultado = resultado.filter((p) => p.operacion === filtros.operacion)
  if (filtros.tipo) resultado = resultado.filter((p) => p.tipo === filtros.tipo)
  if (filtros.distrito) resultado = resultado.filter((p) => p.distrito === filtros.distrito)
  if (typeof filtros.precioMin === 'number') resultado = resultado.filter((p) => p.precio >= filtros.precioMin!)
  if (typeof filtros.precioMax === 'number') resultado = resultado.filter((p) => p.precio <= filtros.precioMax!)
  if (typeof filtros.dormitorios === 'number') resultado = resultado.filter((p) => p.dormitorios >= filtros.dormitorios!)
  return delay(resultado.map(aResumen))
}

export async function getPropertyBySlug(slug: string): Promise<Propiedad | null> {
  if (USE_REAL_API) {
    return fetchAlpha<Propiedad>(`/properties/${slug}`)
  }
  return delay(propiedades.find((p) => p.slug === slug) ?? null)
}

export async function getFeaturedProperties(): Promise<PropiedadResumen[]> {
  if (USE_REAL_API) {
    const data = await fetchAlpha<PropiedadResumen[]>('/properties?destacada=true')
    return data ?? []
  }
  return delay(propiedades.filter((p) => p.destacada).map(aResumen))
}

export async function getProjects(): Promise<Proyecto[]> {
  if (USE_REAL_API) {
    const data = await fetchAlpha<Proyecto[]>('/projects')
    return data ?? []
  }
  return delay(proyectos)
}

export async function getProjectBySlug(slug: string): Promise<Proyecto | null> {
  if (USE_REAL_API) {
    return fetchAlpha<Proyecto>(`/projects/${slug}`)
  }
  return delay(proyectos.find((p) => p.slug === slug) ?? null)
}

export async function getUnitsByProject(slug: string): Promise<Unidad[]> {
  if (USE_REAL_API) {
    const data = await fetchAlpha<Unidad[]>(`/projects/${slug}/units`)
    return data ?? []
  }
  return delay(unidades.filter((u) => u.proyectoSlug === slug))
}

export async function submitLead(data: FormularioConsulta): Promise<ApiRespuesta<{ id: string }>> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error ?? 'No se pudo enviar tu consulta.' }
    return { ok: true, data: json.data }
  } catch {
    return { ok: false, error: 'Error de conexión. Intenta nuevamente.' }
  }
}

export async function submitOwnerLead(data: FormularioPropietario): Promise<ApiRespuesta<{ id: string }>> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, origen: 'propietario' }),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error ?? 'No se pudo enviar tu solicitud.' }
    return { ok: true, data: json.data }
  } catch {
    return { ok: false, error: 'Error de conexión. Intenta nuevamente.' }
  }
}

export async function sendChatMessage(solicitud: ChatSolicitud): Promise<ApiRespuesta<{ reply: string; demo?: boolean }>> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitud),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error ?? 'El asistente no está disponible.' }
    return { ok: true, data: json.data }
  } catch {
    return { ok: false, error: 'Error de conexión con el asistente.' }
  }
}