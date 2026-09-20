import type {
  ApiRespuesta,
  FiltrosBusqueda,
  FormularioConsulta,
  Propiedad,
  PropiedadResumen,
  Proyecto,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

// ─────────────────────────────────────────────
// Tipos de respuesta de Beta
// ─────────────────────────────────────────────
type BetaAsset = {
  id: string
  code: string
  name: string
  description: string | null
  assetType: 'LOT' | 'APARTMENT' | 'HOUSE' | 'COMMERCIAL_SPACE'
  status: 'DRAFT' | 'UNDER_REVIEW' | 'IN_REVIEW' | 'AVAILABLE' | 'RESERVED' | 'SOLD'
  areaM2: string
  currency: string
  currentPrice: string
  ownerPartyId: string | null
  createdAt: string
  updatedAt: string
  parties?: {
    id: string
    organizations?: {
      trade_name: string | null
    } | null
  } | null
}

// ─────────────────────────────────────────────
// Adaptadores de Asset → Propiedad
// ─────────────────────────────────────────────
const TIPO_MAP: Record<BetaAsset['assetType'], Propiedad['tipo']> = {
  LOT: 'casa',
  APARTMENT: 'departamento',
  HOUSE: 'casa',
  COMMERCIAL_SPACE: 'oficina',
}

const ESTADO_MAP: Record<BetaAsset['status'], Propiedad['estado']> = {
  DRAFT: 'Disponible',
  UNDER_REVIEW: 'Disponible',
  IN_REVIEW: 'Disponible',
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'En Negociación',
}

function aPropiedad(asset: BetaAsset): Propiedad {
  const descripcion = asset.description?.trim() ?? ''
  const lineas = descripcion.split('\n').filter((l) => l.trim().length > 0)
  const subtitulo = lineas[0] ?? ''
  const descripcionLarga = lineas.slice(1).join(' ') || subtitulo

  return {
    id: asset.id,
    slug: asset.code.toLowerCase().replace(/_/g, '-'),
    titulo: asset.name,
    subtitulo,
    ubicacion: asset.parties?.organizations?.trade_name ?? 'ZENPLUS',
    distrito: '',
    tipo: TIPO_MAP[asset.assetType],
    operacion: 'venta',
    precio: Number(asset.currentPrice),
    moneda: 'USD',
    areaM2: Number(asset.areaM2),
    dormitorios: 0,
    banos: 0,
    estacionamientos: 0,
    descripcion: descripcionLarga,
    estado: ESTADO_MAP[asset.status],
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    caracteristicas: [],
  }
}

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
  return {
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
  }
}

// ─────────────────────────────────────────────
// API real: consumir Beta
// ─────────────────────────────────────────────
export async function getProperties(
  filtros: FiltrosBusqueda = {}
): Promise<PropiedadResumen[]> {
  const params = new URLSearchParams()
  if (filtros.tipo) params.set('assetType', filtros.tipo.toUpperCase())
  if (filtros.precioMin) params.set('minPrice', String(filtros.precioMin))
  if (filtros.precioMax) params.set('maxPrice', String(filtros.precioMax))

  try {
    const res = await fetch(`${API_URL}/public/assets?${params}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar propiedades')
    const data: BetaAsset[] = await res.json()
    return data.map((a) => aResumen(aPropiedad(a)))
  } catch (err) {
    console.error('getProperties error:', err)
    return []
  }
}

export async function getPropertyBySlug(slug: string): Promise<Propiedad | null> {
  try {
    const res = await fetch(`${API_URL}/public/assets`, { cache: 'no-store' })
    if (!res.ok) return null
    const data: BetaAsset[] = await res.json()

    const match = data.find(
      (a) => a.code.toLowerCase().replace(/_/g, '-') === slug
    )
    if (!match) return null

    return aPropiedad(match)
  } catch (err) {
    console.error('getPropertyBySlug error:', err)
    return null
  }
}

export async function getFeaturedProperties(): Promise<PropiedadResumen[]> {
  try {
    const res = await fetch(`${API_URL}/public/assets`, { cache: 'no-store' })
    if (!res.ok) return []
    const data: BetaAsset[] = await res.json()
    return data.slice(0, 6).map((a) => aResumen(aPropiedad(a)))
  } catch (err) {
    console.error('getFeaturedProperties error:', err)
    return []
  }
}

export async function getProjects(): Promise<Proyecto[]> {
  // No hay endpoint de proyectos en Beta todavía.
  return []
}

// ─────────────────────────────────────────────
// Leads: se mantiene el proxy hacia Beta
// ─────────────────────────────────────────────
export async function submitLead(
  data: FormularioConsulta
): Promise<ApiRespuesta<{ id: string }>> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      return { ok: false, error: json.error ?? 'No se pudo enviar tu consulta.' }
    }
    return { ok: true, data: json.data }
  } catch {
    return { ok: false, error: 'Error de conexión. Intenta nuevamente.' }
  }
}
