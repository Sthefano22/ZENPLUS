import { propiedades, proyectos } from '@/lib/mock'
import type {
  ApiRespuesta,
  FiltrosBusqueda,
  FormularioConsulta,
  Propiedad,
  PropiedadResumen,
  Proyecto,
} from '@/types'

function aResumen(p: Propiedad): PropiedadResumen {
  const {
    id,
    slug,
    titulo,
    ubicacion,
    distrito,
    tipo,
    operacion,
    precio,
    moneda,
    areaM2,
    dormitorios,
    banos,
    estado,
    imagen,
  } = p
  return { id, slug, titulo, ubicacion, distrito, tipo, operacion, precio, moneda, areaM2, dormitorios, banos, estado, imagen }
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function getProperties(filtros: FiltrosBusqueda = {}): Promise<PropiedadResumen[]> {
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
  return delay(propiedades.find((p) => p.slug === slug) ?? null)
}

export async function getFeaturedProperties(): Promise<PropiedadResumen[]> {
  return delay(propiedades.filter((p) => p.destacada).map(aResumen))
}

export async function getProjects(): Promise<Proyecto[]> {
  return delay(proyectos)
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
