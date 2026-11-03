import {
  syntheticOperations,
  syntheticMilestones,
  syntheticDocuments,
  syntheticContractStatus,
  syntheticObligations,
  syntheticPayments,
  syntheticTransactionTimelines,
} from '@/lib/fixtures/transaction'
import type {
  Operation,
  DocumentItem,
  ContractStatus,
  Obligation,
  Payment,
  TransactionMilestone,
  TimelineEvento,
  RolParte,
} from '@/types'
import { requestApi, type ApiResult } from '@/lib/api-client'
import { getClientSession } from '@/lib/session'

const USE_COMMERCIAL_API = process.env.NEXT_PUBLIC_USE_COMMERCIAL_API === 'true'
const BETA_TRANSACTION_API_URL = process.env.NEXT_PUBLIC_BETA_TRANSACTION_API_URL ?? ''

// Copia mutable en memoria para mutaciones durante sesión
export const operations: Operation[] = JSON.parse(JSON.stringify(syntheticOperations))
export const milestones: Record<string, TransactionMilestone[]> = JSON.parse(
  JSON.stringify(syntheticMilestones)
)
export const documents: Record<string, DocumentItem[]> = JSON.parse(
  JSON.stringify(syntheticDocuments)
)
export const contractStatuses: Record<string, ContractStatus> = JSON.parse(
  JSON.stringify(syntheticContractStatus)
)
export const obligations: Record<string, Obligation[]> = JSON.parse(
  JSON.stringify(syntheticObligations)
)
export const payments: Record<string, Payment[]> = JSON.parse(JSON.stringify(syntheticPayments))
export const transactionTimelines: Record<string, TimelineEvento[]> = JSON.parse(
  JSON.stringify(syntheticTransactionTimelines)
)

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function generarId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function getOperations(): Promise<ApiResult<Operation[]>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<Operation[]>(BETA_TRANSACTION_API_URL, '/operations')
  }
  return delay({ ok: true, data: [...operations] })
}

export async function getOperationById(id: string): Promise<ApiResult<Operation>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<Operation>(BETA_TRANSACTION_API_URL, `/operations/${id}`)
  }
  const op = operations.find((o) => o.id === id)
  if (!op) {
    return delay({
      ok: false,
      status: 404,
      message: 'La operación no fue encontrada o no tiene permisos de acceso.',
    })
  }
  return delay({ ok: true, data: op })
}

export async function getOperationMilestones(
  operationId: string
): Promise<ApiResult<TransactionMilestone[]>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<TransactionMilestone[]>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/milestones`
    )
  }
  return delay({ ok: true, data: milestones[operationId] ?? [] })
}

export async function getOperationTimeline(
  operationId: string
): Promise<ApiResult<TimelineEvento[]>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<TimelineEvento[]>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/timeline`
    )
  }
  return delay({ ok: true, data: transactionTimelines[operationId] ?? [] })
}

/**
 * GAM3-003: Document Center con filtrado de Data Scope por rol
 */
export async function getOperationDocuments(
  operationId: string,
  roleScope?: RolParte
): Promise<ApiResult<DocumentItem[]>> {
  if (USE_COMMERCIAL_API) {
    const query = roleScope ? `?roleScope=${roleScope}` : ''
    return requestApi<DocumentItem[]>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/documents${query}`
    )
  }

  const allDocs = documents[operationId] ?? []
  if (!roleScope) {
    return delay({ ok: true, data: allDocs })
  }

  // Filtrado de Data Scope: el rol solo ve documentos autorizados para su parte
  const filtrados = allDocs.filter(
    (d) => d.rolRequerido === roleScope || d.codigoRequisito === 'partida_registral'
  )
  return delay({ ok: true, data: filtrados })
}

/**
 * GAM3-004: Carga segura de nueva versión documental
 */
export async function uploadDocumentVersion(
  operationId: string,
  documentId: string,
  fileData: {
    archivoNombre: string
    tamanoBytes: number
    mimeType: string
  }
): Promise<ApiResult<{ documentId: string; version: number }>> {
  // Validación de contrato de archivo
  if (fileData.tamanoBytes > 10 * 1024 * 1024) {
    return delay({
      ok: false,
      status: 422,
      message: 'El archivo excede el tamaño máximo permitido de 10 MB.',
    })
  }

  const session = getClientSession()
  const usuario = session?.user.nombre || 'Usuario Autorizado'

  if (USE_COMMERCIAL_API) {
    return requestApi(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/documents/${documentId}/versions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData),
      }
    )
  }

  const list = documents[operationId]
  const doc = list?.find((d) => d.id === documentId)
  if (!doc) {
    return delay({ ok: false, status: 404, message: 'Requisito documental no encontrado.' })
  }

  const nuevaVersion = doc.versiones.length + 1
  const ahora = new Date().toISOString()
  doc.versiones.push({
    version: nuevaVersion,
    archivoNombre: fileData.archivoNombre,
    tamanoBytes: fileData.tamanoBytes,
    mimeType: fileData.mimeType,
    subidoPor: usuario,
    subidoEn: ahora,
    urlAccesoTemporal: `https://storage.zenplus.test/docs/op-${operationId}-${documentId}-v${nuevaVersion}.pdf`,
  })
  doc.estado = 'En revisión'
  doc.actualizadoEn = ahora

  // Agregar hito a timeline
  if (!transactionTimelines[operationId]) transactionTimelines[operationId] = []
  transactionTimelines[operationId].push({
    id: generarId('ttl'),
    tipo: 'documento',
    descripcion: `Nueva versión cargada para ${doc.titulo}.`,
    fecha: ahora,
    autor: usuario,
  })

  return delay({ ok: true, data: { documentId, version: nuevaVersion } })
}

/**
 * GAM3-003: Obtención de enlace firmado temporal para descarga
 */
export async function getDocumentAccessLink(
  documentId: string
): Promise<ApiResult<{ urlAccesoTemporal: string; expiraEn: string }>> {
  if (USE_COMMERCIAL_API) {
    return requestApi(BETA_TRANSACTION_API_URL, `/documents/${documentId}/access-link`)
  }

  const expiraEn = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  return delay({
    ok: true,
    data: {
      urlAccesoTemporal: `https://storage.zenplus.test/signed/download-${documentId}?token=sec_${Date.now()}`,
      expiraEn,
    },
  })
}

/**
 * GAM3-005: Estado de Contrato
 */
export async function getContractStatus(
  operationId: string
): Promise<ApiResult<ContractStatus>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<ContractStatus>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/contract-status`
    )
  }
  const status = contractStatuses[operationId]
  if (!status) {
    return delay({ ok: false, status: 404, message: 'Estado de contrato no encontrado.' })
  }
  return delay({ ok: true, data: status })
}

/**
 * GAM3-006: Obligaciones y Pagos
 */
export async function getOperationObligations(
  operationId: string
): Promise<ApiResult<Obligation[]>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<Obligation[]>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/obligations`
    )
  }
  return delay({ ok: true, data: obligations[operationId] ?? [] })
}

export async function getOperationPayments(
  operationId: string
): Promise<ApiResult<Payment[]>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<Payment[]>(
      BETA_TRANSACTION_API_URL,
      `/operations/${operationId}/payments`
    )
  }
  return delay({ ok: true, data: payments[operationId] ?? [] })
}

/**
 * Crea una operación a partir de una reserva confirmada (cierre de Golden E2E F2 -> F3)
 */
export async function createOperationFromReserva(
  reservaId: string,
  opportunityId: string,
  activoInfo: { slug: string; titulo: string; distrito: string; tipo: string; precio: number }
): Promise<ApiResult<Operation>> {
  if (USE_COMMERCIAL_API) {
    return requestApi<Operation>(BETA_TRANSACTION_API_URL, '/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservaId, opportunityId, activoInfo }),
    })
  }

  const id = generarId('op')
  const codigo = `OP-2026-${(operations.length + 1).toString().padStart(3, '0')}`
  const ahora = new Date().toISOString()

  const nuevaOp: Operation = {
    id,
    codigo,
    opportunityId,
    reservaId,
    etapa: 'Iniciada',
    estado: 'Activa',
    proximaAccion: 'Completar checklist documental inicial de comprador y vendedor.',
    creadoEn: ahora,
    actualizadoEn: ahora,
    activo: {
      id: generarId('act'),
      slug: activoInfo.slug,
      titulo: activoInfo.titulo,
      distrito: activoInfo.distrito,
      tipo: activoInfo.tipo as any,
      precioAcordado: activoInfo.precio,
      moneda: 'USD',
    },
    partes: [
      {
        id: generarId('pty'),
        rol: 'comprador',
        nombre: 'Cliente Demo 01',
        email: 'cliente.demo01@example.test',
      },
      {
        id: generarId('pty'),
        rol: 'propietario',
        nombre: 'Propietario Demo 01',
        email: 'propietario.demo01@example.test',
      },
    ],
  }

  operations.push(nuevaOp)
  milestones[id] = [
    {
      id: generarId('ms'),
      etapa: 'Iniciada',
      titulo: 'Operación Creada desde Reserva',
      descripcion: 'Reserva confirmada convertida a operación.',
      completado: true,
      fechaCompletado: ahora,
      orden: 1,
    },
  ]
  documents[id] = [
    {
      id: generarId('doc'),
      operationId: id,
      codigoRequisito: 'dni_comprador',
      titulo: 'Documento de Identidad del Comprador',
      obligatorio: true,
      rolRequerido: 'comprador',
      estado: 'Pendiente',
      versiones: [],
      actualizadoEn: ahora,
    },
  ]

  return delay({ ok: true, data: nuevaOp })
}
