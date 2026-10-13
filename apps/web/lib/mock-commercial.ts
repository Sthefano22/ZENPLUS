import type {Opportunity, Requirement, Visita, OfertaThread, Reserva, TimelineEvento} from '@/types'

export const opportunities: Opportunity[] = [
  {
    id: 'opp-1',
    codigo: 'OPP-2026-001',
    clienteNombre: 'Rodrigo Alvarado Quispe',
    clienteEmail: 'rodrigo.alvarado@example.com',
    clienteTelefono: '+51 987 654 321',
    asesorId: 'ase-1',
    asesorNombre: 'Valeria Cárdenas',
    estado: 'En Proceso',
    creadoEn: '2026-08-10T14:30:00.000Z',
    actualizadoEn: '2026-09-23T10:00:00.000Z',
  },
  {
    id: 'opp-2',
    codigo: 'OPP-2026-002',
    clienteNombre: 'Fiorella Mendoza Ríos',
    clienteEmail: 'fiorella.mendoza@example.com',
    clienteTelefono: '+51 912 345 678',
    asesorId: 'ase-2',
    asesorNombre: 'Renzo Salazar',
    estado: 'Oferta Enviada',
    creadoEn: '2026-07-22T11:00:00.000Z',
    actualizadoEn: '2026-09-19T14:20:00.000Z',
  },
]

export const requirements: Requirement[] = [
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
    notas: 'Busca vista al golf o al mar, prefiere pisos altos.',
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
    notas: 'Cliente busca casa con piscina para inversión familiar.',
    actualizadoEn: '2026-09-20T16:45:00.000Z',
  },
]

export const visitas: Visita[] = [
  {
    id: 'visita-1',
    opportunityId: 'opp-1',
    propiedadSlug: 'sky-penthouse-reserve',
    propiedadTitulo: 'Sky Penthouse Reserve',
    fecha: '2026-09-28',
    hora: '11:00',
    asesorNombre: 'Valeria Cárdenas',
    estado: 'Programada',
  },
  {
    id: 'visita-2',
    opportunityId: 'opp-1',
    propiedadSlug: 'atelier-miraflores-bay-view',
    propiedadTitulo: 'Atelier Miraflores Bay View',
    fecha: '2026-09-10',
    hora: '16:30',
    asesorNombre: 'Valeria Cárdenas',
    estado: 'Realizada',
    feedback: 'Cliente muy interesado en la vista a la bahía, pidió una segunda visita con su esposa.',
    interes: 'Alto',
    siguienteAccion: 'Agendar segunda visita y preparar propuesta de financiamiento.',
  },
  {
    id: 'visita-3',
    opportunityId: 'opp-2',
    propiedadSlug: 'villa-solaria-waterfront',
    propiedadTitulo: 'Villa Solaria Waterfront',
    fecha: '2026-08-30',
    hora: '10:00',
    asesorNombre: 'Renzo Salazar',
    estado: 'Cancelada',
    feedback: 'Cliente canceló por viaje de trabajo, reprogramar en dos semanas.',
  },
]

export const ofertaThreads: OfertaThread[] = [
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
        creadoPor: 'Renzo Salazar',
      },
      {
        version: 2,
        monto: 4650000,
        moneda: 'USD',
        condiciones: 'Propietario solicita 40% inicial y entrega en 60 días.',
        creadoEn: '2026-09-19T14:20:00.000Z',
        creadoPor: 'Propietario (vía Beta)',
      },
    ],
    actualizadoEn: '2026-09-19T14:20:00.000Z',
  },
]

export const reservas: Reserva[] = [
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

export const timelinePorOpportunity: Record<string, TimelineEvento[]> = {
  'opp-1': [
    {
      id: 'te-1',
      tipo: 'estado',
      descripcion: 'Opportunity creada desde formulario de contacto de ficha.',
      fecha: '2026-08-10T14:30:00.000Z',
      autor: 'Sistema',
    },
    {
      id: 'te-2',
      tipo: 'visita',
      descripcion: 'Visita realizada a Atelier Miraflores Bay View. Cliente mostró alto interés.',
      fecha: '2026-09-10T16:30:00.000Z',
      autor: 'Valeria Cárdenas',
    },
    {
      id: 'te-3',
      tipo: 'reserva',
      descripcion: 'Reserva creada para Atelier Miraflores Bay View por USD $1,920,000.',
      fecha: '2026-09-23T10:00:00.000Z',
      autor: 'Valeria Cárdenas',
    },
  ],
  'opp-2': [
    {
      id: 'te-4',
      tipo: 'oferta',
      descripcion: 'Propietario respondió con contraoferta de USD $4,650,000.',
      fecha: '2026-09-19T14:20:00.000Z',
      autor: 'Renzo Salazar',
    },
  ],
}