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
  origen?: 'ficha' | 'propietario' | 'web'
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
  tipo: 'visita' | 'oferta' | 'reserva' | 'nota' | 'estado' | 'hito' | 'documento' | 'pago'
  descripcion: string
  fecha: string
  autor?: string
}

// ── Fase 3: Transaction & Experience ───────────────────────

export type EtapaOperacion =
  | 'Iniciada'
  | 'Documentación'
  | 'Contrato'
  | 'Cierre'
  | 'Completada'
  | 'Cancelada'

export type EstadoOperacion = 'Activa' | 'En Pausa' | 'Completada' | 'Cancelada'

export type RolParte = 'comprador' | 'vendedor' | 'arrendatario' | 'propietario' | 'notario'

export interface OperationParty {
  id: string
  rol: RolParte
  nombre: string
  email: string
  telefono?: string
}

export interface OperationAsset {
  id: string
  slug: string
  titulo: string
  distrito: string
  tipo: TipoPropiedad
  precioAcordado: number
  moneda: 'USD' | 'PEN'
}

export interface TransactionMilestone {
  id: string
  etapa: EtapaOperacion
  titulo: string
  descripcion: string
  completado: boolean
  fechaCompletado?: string
  orden: number
}

export type EstadoDocumento =
  | 'Pendiente'
  | 'Cargado'
  | 'En revisión'
  | 'Aprobado'
  | 'Rechazado'
  | 'Vencido'

export interface DocumentVersion {
  version: number
  archivoNombre: string
  tamanoBytes: number
  mimeType: string
  subidoPor: string
  subidoEn: string
  urlAccesoTemporal?: string
}

export interface DocumentItem {
  id: string
  operationId: string
  codigoRequisito: string
  titulo: string
  descripcion?: string
  obligatorio: boolean
  rolRequerido: RolParte
  estado: EstadoDocumento
  versiones: DocumentVersion[]
  motivoRechazo?: string
  actualizadoEn: string
}

export interface ContractStatus {
  id: string
  operationId: string
  estado: 'Borrador' | 'En Revisión Legal' | 'Listo para Firma' | 'Firmado' | 'Elevado a Escritura'
  numeroReferencia: string
  notariaAsignada?: string
  fechaObjetivoFirma?: string
  observaciones?: string
  actualizadoEn: string
}

export type EstadoObligacion = 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido'

export interface Obligation {
  id: string
  operationId: string
  concepto: string
  monto: number
  moneda: 'USD' | 'PEN'
  fechaVencimiento: string
  estado: EstadoObligacion
  montoPagado: number
  rolResponsable: RolParte
}

export interface Payment {
  id: string
  obligationId: string
  monto: number
  moneda: 'USD' | 'PEN'
  fechaPago: string
  metodoPago: 'Transferencia Bancaria' | 'Cheque de Gerencia' | 'Otro'
  numeroOperacion: string
  estado: 'Verificado' | 'En Verificación' | 'Rechazado'
}

export interface Operation {
  id: string
  codigo: string
  opportunityId: string
  reservaId: string
  etapa: EtapaOperacion
  estado: EstadoOperacion
  activo: OperationAsset
  partes: OperationParty[]
  proximaAccion: string
  creadoEn: string
  actualizadoEn: string
}

// ── Fase 4: Data & Management Intelligence ─────────────────

export type PeriodoDashboard = '7d' | '30d' | '90d' | '12m'
export type RolDashboard = 'direccion' | 'asesor'

export interface MetricContract {
  id: string
  nombre: string
  descripcion: string
  formula: string
  fuente: string
  freshnessMinutos: number
  lastUpdated: string
  isStale: boolean
}

export interface KPICard {
  id: string
  label: string
  valor: number | string
  unidad?: string
  tendencia?: 'sube' | 'baja' | 'estable'
  variacion?: number
  periodo: PeriodoDashboard
  metricContract: MetricContract
  isStale: boolean
  lastUpdated: string
}

export interface FunnelEtapa {
  etapa: string
  cantidad: number
  porcentaje: number
  color: string
}

export interface FunnelComercial {
  periodo: PeriodoDashboard
  etapas: FunnelEtapa[]
  tasaConversionTotal: number
  lastUpdated: string
  isStale: boolean
}

export interface InventarioKPI {
  totalActivos: number
  disponibles: number
  reservados: number
  enNegociacion: number
  publicados: number
  consultasUltimos30d: number
  rotacionPromedioDias: number
  lastUpdated: string
  isStale: boolean
}

export interface AsesorKPI {
  asesorId: string
  asesorNombre: string
  leadsAsignados: number
  sinResponder: number
  visitasProgramadas: number
  ofertasActivas: number
  reservasActivas: number
  tasaConversion: number
  periodo: PeriodoDashboard
  lastUpdated: string
  isStale: boolean
}

export interface TransaccionKPI {
  operacionesTotales: number
  operacionesCerradas: number
  operacionesEnProceso: number
  tiempoPromedioCierreDias: number
  valorTotalUSD: number
  periodo: PeriodoDashboard
  lastUpdated: string
  isStale: boolean
}

export interface SourcePerformance {
  fuente: string
  leads: number
  conversion: number
  porcentajeDelTotal: number
}

export interface SourceKPI {
  periodo: PeriodoDashboard
  fuentes: SourcePerformance[]
  disclaimer: string
  lastUpdated: string
  isStale: boolean
}

export interface XENIAInsight {
  id: string
  titulo: string
  descripcion: string
  fuente: string
  fechaGenerado: string
  alcance: string
  nivelCerteza: 'Alto' | 'Medio' | 'Exploratorio'
  categoria: 'inventario' | 'comercial' | 'asesor' | 'mercado'
}

export interface DashboardFilters {
  periodo: PeriodoDashboard
  zona?: string
  asesorId?: string
  fuente?: string
}
