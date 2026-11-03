import type {
  AsesorKPI,
  FunnelComercial,
  InventarioKPI,
  KPICard,
  MetricContract,
  SourceKPI,
  TransaccionKPI,
  XENIAInsight,
} from '@/types'

/**
 * Flag para simular una falla de la API en los mocks (GAM4-007).
 * Ponerlo en true hace que todas las funciones de lib/api-dashboard.ts rechacen
 * y las páginas muestren el error state con botón de reintento.
 */
export const dashboardMockFlags = { simularError: false }

const HACE_23_MIN = new Date(Date.now() - 23 * 60_000).toISOString()

export const ZONAS_LIMA = [
  'San Isidro',
  'Miraflores',
  'Santiago de Surco',
  'La Molina',
  'Barranco',
  'San Borja',
]

export const FUENTES_MOCK = [
  'Web Orgánico',
  'Google Ads',
  'Referido',
  'Portal Inmobiliario',
  'Instagram',
]

function contrato(
  id: string,
  nombre: string,
  descripcion: string,
  formula: string,
  fuente: string,
  freshnessMinutos: number,
  isStale = false
): MetricContract {
  return { id, nombre, descripcion, formula, fuente, freshnessMinutos, lastUpdated: HACE_23_MIN, isStale }
}

/** Definiciones de métricas (MetricContract). Indexadas por id de KPI. */
export const METRIC_CONTRACTS: Record<string, MetricContract> = {
  'leads-totales': contrato(
    'leads-totales',
    'Leads totales',
    'Contactos nuevos registrados en el CRM durante el periodo.',
    'COUNT(leads creados en el periodo)',
    'CRM Beta',
    60
  ),
  'tasa-conversion': contrato(
    'tasa-conversion',
    'Tasa de conversión lead → operación',
    'Porcentaje de leads del periodo que terminaron en una operación cerrada.',
    'operaciones cerradas ÷ leads totales × 100',
    'CRM Beta',
    60
  ),
  'operaciones-cerradas': contrato(
    'operaciones-cerradas',
    'Operaciones cerradas',
    'Operaciones con estado Cerrada Ganada dentro del periodo.',
    'COUNT(opportunities en Cerrada Ganada)',
    'Commercial Engine Beta',
    60
  ),
  'valor-total': contrato(
    'valor-total',
    'Valor total de operaciones',
    'Suma del precio de cierre registrado de las operaciones cerradas.',
    'SUM(precio de cierre, USD)',
    'Commercial Engine Beta',
    60
  ),
  'tiempo-cierre': contrato(
    'tiempo-cierre',
    'Tiempo promedio de cierre',
    'Días promedio entre la creación del lead y el cierre de la operación.',
    'AVG(fecha cierre − fecha creación del lead)',
    'Commercial Engine Beta',
    15,
    true
  ),
  'activos-disponibles': contrato(
    'activos-disponibles',
    'Activos disponibles',
    'Activos publicables sin reserva ni negociación activa.',
    'COUNT(activos con estado Disponible)',
    'Inventario Alpha',
    60
  ),
  'inv-reservados': contrato(
    'inv-reservados',
    'Activos reservados',
    'Activos con una reserva activa vigente.',
    'COUNT(activos con reserva Activa)',
    'Inventario Alpha',
    60
  ),
  'inv-negociacion': contrato(
    'inv-negociacion',
    'Activos en negociación',
    'Activos con una oferta abierta (enviada, en negociación o contraoferta).',
    'COUNT(activos con oferta abierta)',
    'Inventario Alpha + Commercial Engine Beta',
    60
  ),
  'inv-publicados': contrato(
    'inv-publicados',
    'Activos publicados',
    'Activos visibles actualmente en el sitio público.',
    'COUNT(activos publicados)',
    'Inventario Alpha',
    60
  ),
  'tx-totales': contrato(
    'tx-totales',
    'Operaciones totales',
    'Operaciones que llegaron al menos a la etapa de reserva en el periodo.',
    'COUNT(operaciones con reserva)',
    'Commercial Engine Beta',
    60
  ),
  'tx-cerradas': contrato(
    'tx-cerradas',
    'Operaciones cerradas',
    'Operaciones con estado Cerrada Ganada dentro del periodo.',
    'COUNT(opportunities en Cerrada Ganada)',
    'Commercial Engine Beta',
    60
  ),
  'tx-en-proceso': contrato(
    'tx-en-proceso',
    'Operaciones en proceso',
    'Operaciones con reserva vigente que aún no se cierran.',
    'operaciones totales − operaciones cerradas',
    'Commercial Engine Beta',
    60
  ),
  'tx-tiempo-cierre': contrato(
    'tx-tiempo-cierre',
    'Tiempo promedio de cierre',
    'Días promedio entre la creación del lead y el cierre de la operación.',
    'AVG(fecha cierre − fecha creación del lead)',
    'Commercial Engine Beta',
    60
  ),
  'tx-valor-total': contrato(
    'tx-valor-total',
    'Valor total de operaciones',
    'Suma del precio de cierre registrado de las operaciones cerradas.',
    'SUM(precio de cierre, USD)',
    'Commercial Engine Beta',
    60
  ),
}

// ── KPIs de Dirección (30d) ────────────────────────────────

export const kpisDireccion: KPICard[] = [
  {
    id: 'leads-totales',
    label: 'Leads totales',
    valor: 847,
    tendencia: 'sube',
    variacion: 12,
  },
  {
    id: 'tasa-conversion',
    label: 'Conversión lead → operación',
    valor: 3.2,
    unidad: '%',
    tendencia: 'estable',
    variacion: 0,
  },
  {
    id: 'operaciones-cerradas',
    label: 'Operaciones cerradas',
    valor: 27,
    tendencia: 'sube',
    variacion: 8,
  },
  {
    id: 'valor-total',
    label: 'Valor total de operaciones',
    valor: 4250000,
    unidad: 'USD',
    tendencia: 'sube',
    variacion: 5,
  },
  {
    id: 'tiempo-cierre',
    label: 'Tiempo promedio de cierre',
    valor: 42,
    unidad: 'días',
    tendencia: 'baja',
    variacion: -3,
  },
  {
    id: 'activos-disponibles',
    label: 'Activos disponibles',
    valor: 134,
    tendencia: 'estable',
    variacion: 0,
  },
].map((k) => {
  const metricContract = METRIC_CONTRACTS[k.id]
  return {
    ...k,
    tendencia: k.tendencia as KPICard['tendencia'],
    periodo: '30d' as const,
    metricContract,
    isStale: metricContract.isStale,
    lastUpdated: metricContract.lastUpdated,
  }
})

// ── Funnel comercial (30d) ─────────────────────────────────

export const funnelComercial: FunnelComercial = {
  periodo: '30d',
  etapas: [
    { etapa: 'Leads', cantidad: 847, porcentaje: 100, color: 'primary' },
    { etapa: 'Calificados', cantidad: 423, porcentaje: 49.9, color: 'primary' },
    { etapa: 'Opportunities', cantidad: 186, porcentaje: 22, color: 'primary' },
    { etapa: 'Visitas', cantidad: 94, porcentaje: 11.1, color: 'secondary' },
    { etapa: 'Ofertas', cantidad: 41, porcentaje: 4.8, color: 'secondary' },
    { etapa: 'Reservas', cantidad: 31, porcentaje: 3.7, color: 'secondary' },
    { etapa: 'Operaciones cerradas', cantidad: 27, porcentaje: 3.2, color: 'primary' },
  ],
  tasaConversionTotal: 3.2,
  lastUpdated: HACE_23_MIN,
  isStale: false,
}

// ── Inventario ─────────────────────────────────────────────

export const inventarioKPI: InventarioKPI = {
  totalActivos: 312,
  disponibles: 134,
  reservados: 31,
  enNegociacion: 41,
  publicados: 289,
  consultasUltimos30d: 2847,
  rotacionPromedioDias: 67,
  lastUpdated: HACE_23_MIN,
  isStale: false,
}

/** Desglose por zona (suma 312 activos y 2.847 consultas, coherente con inventarioKPI). */
export const inventarioPorZona = [
  { zona: 'San Isidro', activos: 94, consultas: 812, rotacionDias: 58 },
  { zona: 'Miraflores', activos: 88, consultas: 903, rotacionDias: 63 },
  { zona: 'Santiago de Surco', activos: 71, consultas: 624, rotacionDias: 74 },
  { zona: 'La Molina', activos: 59, consultas: 508, rotacionDias: 79 },
]

// ── Asesores ───────────────────────────────────────────────

export const asesoresKPI: AsesorKPI[] = [
  {
    asesorId: 'ase-1',
    asesorNombre: 'Valeria Cárdenas',
    leadsAsignados: 142,
    sinResponder: 2,
    visitasProgramadas: 21,
    ofertasActivas: 9,
    reservasActivas: 7,
    tasaConversion: 5.6,
    periodo: '30d',
    lastUpdated: HACE_23_MIN,
    isStale: false,
  },
  {
    asesorId: 'ase-2',
    asesorNombre: 'Renzo Salazar',
    leadsAsignados: 118,
    sinResponder: 6,
    visitasProgramadas: 15,
    ofertasActivas: 6,
    reservasActivas: 4,
    tasaConversion: 3.4,
    periodo: '30d',
    lastUpdated: HACE_23_MIN,
    isStale: false,
  },
  {
    asesorId: 'ase-3',
    asesorNombre: 'Mariana Quispe Paredes',
    leadsAsignados: 96,
    sinResponder: 11,
    visitasProgramadas: 9,
    ofertasActivas: 3,
    reservasActivas: 2,
    tasaConversion: 1.0,
    periodo: '30d',
    lastUpdated: HACE_23_MIN,
    isStale: false,
  },
]

// ── Transacciones ──────────────────────────────────────────

export const transaccionKPI: TransaccionKPI = {
  operacionesTotales: 31,
  operacionesCerradas: 27,
  operacionesEnProceso: 4,
  tiempoPromedioCierreDias: 42,
  valorTotalUSD: 4250000,
  periodo: '30d',
  lastUpdated: HACE_23_MIN,
  isStale: false,
}

export const operacionesPorMes = [
  { label: 'May', valor: 19 },
  { label: 'Jun', valor: 22 },
  { label: 'Jul', valor: 20 },
  { label: 'Ago', valor: 24 },
  { label: 'Sep', valor: 25 },
  { label: 'Oct', valor: 27 },
]

export const operacionesPorZona = [
  { label: 'San Isidro', valor: 11 },
  { label: 'Miraflores', valor: 9 },
  { label: 'Surco', valor: 7 },
]

// ── Fuentes ────────────────────────────────────────────────

export const sourceKPI: SourceKPI = {
  periodo: '30d',
  fuentes: [
    { fuente: 'Web Orgánico', leads: 268, conversion: 3.4, porcentajeDelTotal: 31.6 },
    { fuente: 'Google Ads', leads: 214, conversion: 2.6, porcentajeDelTotal: 25.3 },
    { fuente: 'Referido', leads: 162, conversion: 5.6, porcentajeDelTotal: 19.1 },
    { fuente: 'Portal Inmobiliario', leads: 131, conversion: 2.0, porcentajeDelTotal: 15.5 },
    { fuente: 'Instagram', leads: 72, conversion: 1.4, porcentajeDelTotal: 8.5 },
  ],
  disclaimer:
    'La atribución es de último clic. Los datos de campañas externas pueden tener hasta 48h de retraso. No usar para decisiones de inversión sin validar con el equipo de Marketing.',
  lastUpdated: HACE_23_MIN,
  isStale: false,
}

// ── XENIA Insights ─────────────────────────────────────────

export const xeniaInsights: XENIAInsight[] = [
  {
    id: 'xi-1',
    titulo: 'Miraflores concentra la mayor demanda de consultas',
    descripcion:
      'Miraflores acumula 903 consultas en 30 días (32% del total) con solo 88 activos, la mayor relación consultas por activo del portafolio.',
    fuente: 'Inventario Alpha · Consultas del sitio público',
    fechaGenerado: '2026-10-07T08:00:00.000Z',
    alcance: 'Portafolio completo · últimos 30 días',
    nivelCerteza: 'Alto',
    categoria: 'inventario',
  },
  {
    id: 'xi-2',
    titulo: 'Los leads por referido convierten más que los de pauta',
    descripcion:
      'Los leads referidos convierten al 5.6%, más del doble que Google Ads (2.6%). La diferencia es consistente en las últimas cuatro semanas, aunque la muestra de referidos es menor (162 leads).',
    fuente: 'CRM Beta · Atribución último clic',
    fechaGenerado: '2026-10-07T08:00:00.000Z',
    alcance: 'Todas las fuentes · últimos 30 días',
    nivelCerteza: 'Medio',
    categoria: 'comercial',
  },
  {
    id: 'xi-3',
    titulo: 'Leads sin responder se acumulan en un asesor',
    descripcion:
      'Un asesor concentra 11 leads sin responder, casi el doble que el siguiente asesor. Podría relacionarse con la carga asignada; falta contrastar con disponibilidad y horarios.',
    fuente: 'CRM Beta · Asignación de leads',
    fechaGenerado: '2026-10-06T08:00:00.000Z',
    alcance: 'Equipo comercial · últimos 30 días',
    nivelCerteza: 'Exploratorio',
    categoria: 'asesor',
  },
]
