import type {
  Operation,
  DocumentItem,
  ContractStatus,
  Obligation,
  Payment,
  TransactionMilestone,
  TimelineEvento,
} from '@/types'

export const syntheticOperations: Operation[] = [
  {
    id: 'op-1',
    codigo: 'OP-2026-001',
    opportunityId: 'opp-1',
    reservaId: 'reserva-1',
    etapa: 'Documentación',
    estado: 'Activa',
    proximaAccion: 'Validar partida registral y poder del propietario.',
    creadoEn: '2026-09-24T10:00:00.000Z',
    actualizadoEn: '2026-09-29T14:30:00.000Z',
    activo: {
      id: '1',
      slug: 'sky-penthouse-reserve',
      titulo: 'Sky Penthouse Reserve',
      distrito: 'San Isidro',
      tipo: 'penthouse',
      precioAcordado: 1250000,
      moneda: 'USD',
    },
    partes: [
      {
        id: 'party-comprador',
        rol: 'comprador',
        nombre: 'Cliente Demo 01',
        email: 'cliente.demo01@example.test',
        telefono: '+51 900 000 001',
      },
      {
        id: 'party-vendedor',
        rol: 'propietario',
        nombre: 'Propietario Demo 01',
        email: 'propietario.demo01@example.test',
        telefono: '+51 900 000 010',
      },
    ],
  },
]

export const syntheticMilestones: Record<string, TransactionMilestone[]> = {
  'op-1': [
    {
      id: 'ms-1',
      etapa: 'Iniciada',
      titulo: 'Reserva Confirmada y Creación de Operación',
      descripcion: 'Reserva validada con señal de trato inicial recibida.',
      completado: true,
      fechaCompletado: '2026-09-24T10:00:00.000Z',
      orden: 1,
    },
    {
      id: 'ms-2',
      etapa: 'Documentación',
      titulo: 'Recolección y Verificación Documentaria',
      descripcion: 'Carga de documentos de identidad, partida registral y HR/PU.',
      completado: false,
      orden: 2,
    },
    {
      id: 'ms-3',
      etapa: 'Contrato',
      titulo: 'Minuta de Compraventa y Revisión Legal',
      descripcion: 'Borrador de minuta aprobado por ambas partes y notaría designada.',
      completado: false,
      orden: 3,
    },
    {
      id: 'ms-4',
      etapa: 'Cierre',
      titulo: 'Firma Notarial y Desembolso',
      descripcion: 'Firma de escritura pública y entrega de cheques de gerencia.',
      completado: false,
      orden: 4,
    },
    {
      id: 'ms-5',
      etapa: 'Completada',
      titulo: 'Entrega de Inmueble y Registro en Sunarp',
      descripcion: 'Acta de entrega de llaves e inscripción del título.',
      completado: false,
      orden: 5,
    },
  ],
}

export const syntheticDocuments: Record<string, DocumentItem[]> = {
  'op-1': [
    {
      id: 'doc-1',
      operationId: 'op-1',
      codigoRequisito: 'dni_comprador',
      titulo: 'Documento de Identidad del Comprador (DNI/CE/Pasaporte)',
      descripcion: 'Copia legible por ambas caras del documento vigente.',
      obligatorio: true,
      rolRequerido: 'comprador',
      estado: 'Aprobado',
      versiones: [
        {
          version: 1,
          archivoNombre: 'documento_identidad_demo.pdf',
          tamanoBytes: 1048576,
          mimeType: 'application/pdf',
          subidoPor: 'Cliente Demo 01',
          subidoEn: '2026-09-25T11:00:00.000Z',
          urlAccesoTemporal: 'https://storage.zenplus.test/docs/demo-identidad.pdf',
        },
      ],
      actualizadoEn: '2026-09-25T14:00:00.000Z',
    },
    {
      id: 'doc-2',
      operationId: 'op-1',
      codigoRequisito: 'partida_registral',
      titulo: 'Copia Literal o Certificado de Cargas (Sunarp)',
      descripcion: 'Con antigüedad no mayor a 30 días calendario.',
      obligatorio: true,
      rolRequerido: 'propietario',
      estado: 'En revisión',
      versiones: [
        {
          version: 1,
          archivoNombre: 'copia_literal_sunarp_demo.pdf',
          tamanoBytes: 2450000,
          mimeType: 'application/pdf',
          subidoPor: 'Propietario Demo 01',
          subidoEn: '2026-09-26T16:00:00.000Z',
          urlAccesoTemporal: 'https://storage.zenplus.test/docs/demo-partida.pdf',
        },
      ],
      actualizadoEn: '2026-09-26T16:00:00.000Z',
    },
    {
      id: 'doc-3',
      operationId: 'op-1',
      codigoRequisito: 'hr_pu_municipal',
      titulo: 'Declaración Jurada de Autovalúo (HR y PU del año en curso)',
      descripcion: 'Emitido por la municipalidad distrital correspondiente.',
      obligatorio: true,
      rolRequerido: 'propietario',
      estado: 'Pendiente',
      versiones: [],
      actualizadoEn: '2026-09-24T10:00:00.000Z',
    },
    {
      id: 'doc-4',
      operationId: 'op-1',
      codigoRequisito: 'comprobante_fondos',
      titulo: 'Sustento de Origen de Fondos / Carta de Aprobación Bancaria',
      descripcion: 'Carta de aprobación de crédito hipotecario o extracto bancario.',
      obligatorio: false,
      rolRequerido: 'comprador',
      estado: 'Pendiente',
      versiones: [],
      actualizadoEn: '2026-09-24T10:00:00.000Z',
    },
  ],
}

export const syntheticContractStatus: Record<string, ContractStatus> = {
  'op-1': {
    id: 'ctr-1',
    operationId: 'op-1',
    estado: 'En Revisión Legal',
    numeroReferencia: 'MINUTA-2026-089-NOT',
    notariaAsignada: 'Notaría Rodríguez & Asociados (San Isidro)',
    fechaObjetivoFirma: '2026-10-20',
    observaciones: 'Pendiente revisión de cláusula de arbitraje comercial por parte del asesor legal del comprador.',
    actualizadoEn: '2026-09-28T09:30:00.000Z',
  },
}

export const syntheticObligations: Record<string, Obligation[]> = {
  'op-1': [
    {
      id: 'obl-1',
      operationId: 'op-1',
      concepto: 'Señal de Trato / Reserva Inicial (5%)',
      monto: 62500,
      moneda: 'USD',
      fechaVencimiento: '2026-09-25',
      estado: 'Pagado',
      montoPagado: 62500,
      rolResponsable: 'comprador',
    },
    {
      id: 'obl-2',
      operationId: 'op-1',
      concepto: 'Cuota Inicial a la Firma de Minuta (30%)',
      monto: 375000,
      moneda: 'USD',
      fechaVencimiento: '2026-10-20',
      estado: 'Pendiente',
      montoPagado: 0,
      rolResponsable: 'comprador',
    },
    {
      id: 'obl-3',
      operationId: 'op-1',
      concepto: 'Saldo Final contra Escritura Pública y Entrega (65%)',
      monto: 812500,
      moneda: 'USD',
      fechaVencimiento: '2026-11-15',
      estado: 'Pendiente',
      montoPagado: 0,
      rolResponsable: 'comprador',
    },
  ],
}

export const syntheticPayments: Record<string, Payment[]> = {
  'op-1': [
    {
      id: 'pay-1',
      obligationId: 'obl-1',
      monto: 62500,
      moneda: 'USD',
      fechaPago: '2026-09-24',
      metodoPago: 'Transferencia Bancaria',
      numeroOperacion: 'TRF-BCP-983172',
      estado: 'Verificado',
    },
  ],
}

export const syntheticTransactionTimelines: Record<string, TimelineEvento[]> = {
  'op-1': [
    {
      id: 'ttl-1',
      tipo: 'hito',
      descripcion: 'Operación iniciada tras confirmación de reserva comercial.',
      fecha: '2026-09-24T10:00:00.000Z',
      autor: 'Sistema',
    },
    {
      id: 'ttl-2',
      tipo: 'pago',
      descripcion: 'Pago de USD $62,500 verificado para Señal de Trato inicial.',
      fecha: '2026-09-24T12:00:00.000Z',
      autor: 'Finanzas',
    },
    {
      id: 'ttl-3',
      tipo: 'documento',
      descripcion: 'Documento de identidad del comprador aprobado por el equipo de cumplimiento.',
      fecha: '2026-09-25T14:00:00.000Z',
      autor: 'Asesor Demo 01',
    },
    {
      id: 'ttl-4',
      tipo: 'documento',
      descripcion: 'Propietario cargó Copia Literal de Sunarp. En proceso de validación legal.',
      fecha: '2026-09-26T16:00:00.000Z',
      autor: 'Propietario Demo 01',
    },
  ],
}
