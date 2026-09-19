export type Operacion = 'venta' | 'alquiler'

export type TipoPropiedad = 'penthouse' | 'departamento' | 'casa' | 'oficina'

export type EstadoPropiedad =
  | 'Venta Exclusiva'
  | 'Alquiler Prime'
  | 'Disponible'
  | 'En Negociación'
  | 'Oportunidad de Inversión'
  | 'Reservado'

export interface Propiedad {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  ubicacion: string
  distrito: string
  tipo: TipoPropiedad
  operacion: Operacion
  precio: number
  moneda: 'USD'
  areaM2: number
  dormitorios: number
  banos: number
  estacionamientos: number
  descripcion: string
  estado: EstadoPropiedad
  imagen: string
  destacada?: boolean
  caracteristicas: string[]
}

export interface PropiedadResumen
  extends Pick<
    Propiedad,
    | 'id'
    | 'slug'
    | 'titulo'
    | 'ubicacion'
    | 'distrito'
    | 'tipo'
    | 'operacion'
    | 'precio'
    | 'moneda'
    | 'areaM2'
    | 'dormitorios'
    | 'banos'
    | 'estado'
    | 'imagen'
  > {}

export type EstadoProyecto = 'Preventa' | 'En Construcción' | 'Planos Aprobados' | 'Entregado'

export interface Proyecto {
  id: string
  slug: string
  nombre: string
  distrito: string
  estado: EstadoProyecto
  precioDesde: number
  niveles: number
  unidades: number
  unidadesDisponibles: number
  avanceConstruccion?: number
  certificacion: string
  capRate: number
  descripcion: string
  imagen: string
}

export interface FiltrosBusqueda {
  operacion?: Operacion
  tipo?: TipoPropiedad
  distrito?: string
  precioMin?: number
  precioMax?: number
  dormitorios?: number
}

export interface FormularioConsulta {
  nombre: string
  email: string
  telefono?: string
  mensaje: string
  propiedadRef?: string
}

export interface ApiRespuesta<T> {
  ok: boolean
  data?: T
  error?: string
}
