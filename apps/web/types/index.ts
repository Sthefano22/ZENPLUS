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

export interface FormularioPropietario {
  nombre: string
  email: string
  telefono: string
  tipoInmueble: TipoPropiedad
  operacion: Operacion
  distrito: string
  precioAproximado?: number
  mensaje?: string
}

export interface ApiRespuesta<T> {
  ok: boolean
  data?: T
  error?: string
}

export type ChatRol = 'user' | 'assistant'

export interface ChatMensaje {
  id: string
  rol: ChatRol
  contenido: string
  creadoEn: number
  error?: boolean
}

export interface ChatSolicitud {
  sessionId: string
  mensajes: Pick<ChatMensaje, 'rol' | 'contenido'>[]
  contexto?: { pathname?: string }
}

export type EstadoUnidad = 'Disponible' | 'Reservada' | 'Vendida'

export interface Unidad {
  id: string
  proyectoSlug: string
  codigo: string
  torre: string
  piso: number
  tipo: TipoPropiedad
  areaM2: number
  dormitorios: number
  banos: number
  precio: number
  estado: EstadoUnidad
}

// ── Fase 2: Commercial Engine ──────────────────────────────

export type EstadoOpportunity =
  | 'Nueva'
  | 'Calificada'
  | 'En Proceso'
  | 'Oferta Enviada'
  | 'Reservada'
  | 'Cerrada Ganada'
  | 'Cerrada Perdida'

export interface Opportunity {
  id: string
  codigo: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono?: string
  asesorId: string
  asesorNombre: string
  estado: EstadoOpportunity
  creadoEn: string
  actualizadoEn: string
}

export interface Requirement {
  id: string
  opportunityId: string
  operacion: Operacion
  tipos: TipoPropiedad[]
  distritos: string[]
  presupuestoMin?: number
  presupuestoMax?: number
  areaMinM2?: number
  dormitoriosMin?: number
  notas?: string
  actualizadoEn: string
}

export type EstadoVisita =
  | 'Programada'
  | 'Confirmada'
  | 'Realizada'
  | 'No Show'
  | 'Cancelada'
  | 'Reprogramada'

export interface Visita {
  id: string
  opportunityId: string
  propiedadSlug: string
  propiedadTitulo: string
  fecha: string
  hora: string
  asesorNombre: string
  estado: EstadoVisita
  feedback?: string
  interes?: 'Alto' | 'Medio' | 'Bajo' | 'Sin interés'
  siguienteAccion?: string
}

export type EstadoOferta =
  | 'Borrador'
  | 'Enviada'
  | 'En Negociación'
  | 'Contraoferta'
  | 'Aceptada'
  | 'Rechazada'
  | 'Expirada'

export interface OfertaVersion {
  version: number
  monto: number
  moneda: 'USD' | 'PEN'
  condiciones?: string
  creadoEn: string
  creadoPor: string
}

export interface OfertaThread {
  id: string
  opportunityId: string
  propiedadSlug: string
  propiedadTitulo: string
  estado: EstadoOferta
  versiones: OfertaVersion[]
  actualizadoEn: string
}

export type EstadoReserva =
  | 'Activa'
  | 'Expirada'
  | 'Cancelada'
  | 'Convertida'

export interface Reserva {
  id: string
  opportunityId: string
  propiedadSlug: string
  propiedadTitulo: string
  monto: number
  moneda: 'USD' | 'PEN'
  estado: EstadoReserva
  expiraEn: string
  creadoEn: string
}

export interface TimelineEvento {
  id: string
  tipo: 'visita' | 'oferta' | 'reserva' | 'nota' | 'estado'
  descripcion: string
  fecha: string
  autor?: string
}