import type {
  Opportunity,
  Requirement,
  Visita,
  OfertaThread,
  Reserva,
  TimelineEvento,
} from '@/types'

/**
 * Fixtures sintéticos para la Célula Gamma (Fase 2 / Commercial Engine)
 * Regla de Oro: Sin nombres reales ni PII verosímil. Solo identificadores y nombres demostrativos.
 */

export const syntheticOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    codigo: 'OPP-2026-001',
    clienteNombre: 'Cliente Demo 01',
    clienteEmail: 'cliente.demo01@example.test',
    clienteTelefono: '+51 900 000 001',
    asesorId: 'ase-1',
    asesorNombre: 'Asesor Demo 01',
    estado: 'En Proceso',
    creadoEn: '2026-08-10T14:30:00.000Z',
    actualizadoEn: '2026-09-23T10:00:00.000Z',
  },
  {
    id: 'opp-2',
    codigo: 'OPP-2026-002',
    clienteNombre: 'Cliente Demo 02',
    clienteEmail: 'cliente.demo02@example.test',
    clienteTelefono: '+51 900 000 002',
    asesorId: 'ase-2',
    asesorNombre: 'Asesor Demo 02',
    estado: 'Oferta Enviada',
    creadoEn: '2026-07-22T11:00:00.000Z',
    actualizadoEn: '2026-09-19T14:20:00.000Z',
  },
  {
    id: 'opp-3',
    codigo: 'OPP-2026-003',
    clienteNombre: 'Cliente Demo 03',
    clienteEmail: 'cliente.demo03@example.test',
    clienteTelefono: '+51 900 000 003',
    asesorId: 'ase-1',
    asesorNombre: 'Asesor Demo 01',
    estado: 'Nueva',
    creadoEn: '2026-09-25T08:00:00.000Z',
    actualizadoEn: '2026-09-25T08:00:00.000Z',
  },
]

export const syntheticRequirements: Requirement[] = [
  {
    id: 'req-1',
    opportunityId: 'opp-1',
    operacion: 'venta',
    tipos: ['penthouse', 'departamento'],
    distritos: ['San Isidro', 'Miraflores'],
    presupuestoMin: 1000000,
    presupuestoMax: 2000000,
    areaMinM2: 200,
    dormitoriosMin: 3,
    notas: 'Interés en departamentos con terrazas amplias o vista panorámica.',
    actualizadoEn: '2026-09-18T09:15:00.000Z',
  },
  {
    id: 'req-2',
    opportunityId: 'opp-2',
    operacion: 'venta',
    tipos: ['casa'],
    distritos: ['Santiago de Surco', 'La Molina'],
    presupuestoMin: 3000000,
    presupuestoMax: 5000000,
    areaMinM2: 500,
    dormitoriosMin: 4,
    notas: 'Inmueble unifamiliar con jardín o piscina privada.',
    actualizadoEn: '2026-09-20T16:45:00.000Z',
  },
  {
    id: 'req-3',
    opportunityId: 'opp-3',
    operacion: 'alquiler',
    tipos: ['departamento'],
    distritos: ['Barranco', 'Miraflores'],
    presupuestoMin: 2000,
    presupuestoMax: 4500,
    areaMinM2: 90,
    dormitoriosMin: 2,
    notas: 'Amoblado preferente, contrato mínimo 12 meses.',
    actualizadoEn: '2026-09-25T08:05:00.000Z',
  },
]

export const syntheticVisitas: Visita[] = [
  {
    id: 'visita-1',
    opportunityId: 'opp-1',
    propiedadSlug: 'sky-penthouse-reserve',
    propiedadTitulo: 'Sky Penthouse Reserve',
    fecha: '2026-09-28',
    hora: '11:00',
    asesorNombre: 'Asesor Demo 01',
    estado: 'Programada',
  },
  {
    id: 'visita-2',
    opportunityId: 'opp-1',
    propiedadSlug: 'atelier-miraflores-bay-view',
    propiedadTitulo: 'Atelier Miraflores Bay View',
    fecha: '2026-09-10',
    hora: '16:30',
    asesorNombre: 'Asesor Demo 01',
    estado: 'Realizada',
    feedback: 'Cliente muy conforme con la distribución, solicita segunda visita con arquitecto.',
    interes: 'Alto',
    siguienteAccion: 'Agendar segunda visita y coordinar borrador de oferta.',
  },
  {
    id: 'visita-3',
    opportunityId: 'opp-2',
    propiedadSlug: 'villa-solaria-waterfront',
    propiedadTitulo: 'Villa Solaria Waterfront',
    fecha: '2026-08-30',
    hora: '10:00',
    asesorNombre: 'Asesor Demo 02',
    estado: 'Cancelada',
    feedback: 'Cliente canceló por viaje imprevisto.',
  },
]

export const syntheticOfertaThreads: OfertaThread[] = [
  {
    id: 'oferta-1',
    opportunityId: 'opp-2',
    propiedadSlug: 'villa-solaria-waterfront',
    propiedadTitulo: 'Villa Solaria Waterfront',
    estado: 'Contraoferta',
    versiones: [
      {
        version: 1,
        monto: 4500000,
        moneda: 'USD',
        condiciones: 'Pago 30% inicial, saldo contra entrega de título.',
        creadoEn: '2026-09-15T10:00:00.000Z',
        creadoPor: 'Asesor Demo 02',
      },
      {
        version: 2,
        monto: 4650000,
        moneda: 'USD',
        condiciones: 'Propietario solicita 40% inicial y plazo de 60 días para desocupación.',
        creadoEn: '2026-09-19T14:20:00.000Z',
        creadoPor: 'Propietario Demo (vía Beta)',
      },
    ],
    actualizadoEn: '2026-09-19T14:20:00.000Z',
  },
]

export const syntheticReservas: Reserva[] = [
  {
    id: 'reserva-1',
    opportunityId: 'opp-1',
    propiedadSlug: 'atelier-miraflores-bay-view',
    propiedadTitulo: 'Atelier Miraflores Bay View',
    monto: 1920000,
    moneda: 'USD',
    estado: 'Activa',
    expiraEn: '2026-09-30T10:00:00.000Z',
    creadoEn: '2026-09-23T10:00:00.000Z',
  },
]

export const syntheticTimelinePorOpportunity: Record<string, TimelineEvento[]> = {
  'opp-1': [
    {
      id: 'te-1',
      tipo: 'estado',
      descripcion: 'Opportunity creada desde formulario web de ficha.',
      fecha: '2026-08-10T14:30:00.000Z',
      autor: 'Sistema',
    },
    {
      id: 'te-2',
      tipo: 'visita',
      descripcion: 'Visita realizada a Atelier Miraflores Bay View. Interés alto.',
      fecha: '2026-09-10T16:30:00.000Z',
      autor: 'Asesor Demo 01',
    },
    {
      id: 'te-3',
      tipo: 'reserva',
      descripcion: 'Reserva creada para Atelier Miraflores Bay View por USD $1,920,000.',
      fecha: '2026-09-23T10:00:00.000Z',
      autor: 'Asesor Demo 01',
    },
  ],
  'opp-2': [
    {
      id: 'te-4',
      tipo: 'oferta',
      descripcion: 'Propietario respondió con contraoferta de USD $4,650,000.',
      fecha: '2026-09-19T14:20:00.000Z',
      autor: 'Asesor Demo 02',
    },
  ],
  'opp-3': [
    {
      id: 'te-5',
      tipo: 'estado',
      descripcion: 'Opportunity registrada pendiente de contacto inicial.',
      fecha: '2026-09-25T08:00:00.000Z',
      autor: 'Sistema',
    },
  ],
}
