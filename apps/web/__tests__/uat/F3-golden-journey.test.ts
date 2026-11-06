import { describe, it, expect } from 'vitest'
import {
  getOperations,
  getOperationById,
  createOperationFromReserva,
  getOperationDocuments,
  uploadDocumentVersion,
  getDocumentAccessLink,
  getContractStatus,
  getOperationObligations,
  getOperationPayments,
  getOperationMilestones,
} from '@/lib/api-transaction'

describe('UAT Golden E2E Journey - Fase 3 (Transaction & Experience)', () => {
  it('executes full Transaction Golden E2E flow with data scope & document lifecycle', async () => {
    // 1. Convertir reserva confirmada a Operación Transaccional
    const createOpRes = await createOperationFromReserva('reserva-1', 'opp-1', {
      slug: 'sky-penthouse-reserve',
      titulo: 'Sky Penthouse Reserve',
      distrito: 'San Isidro',
      tipo: 'penthouse',
      precio: 1250000,
    })
    expect(createOpRes.ok).toBe(true)
    if (!createOpRes.ok) return
    const op = createOpRes.data
    expect(op.id).toBeDefined()
    expect(op.codigo).toMatch(/^OP-2026-/)

    // 2. Verificar vinculación de partes y activo
    expect(op.partes.length).toBe(2)
    expect(op.activo.slug).toBe('sky-penthouse-reserve')

    // 3. Verificar stepper de hitos
    const msRes = await getOperationMilestones(op.id)
    expect(msRes.ok).toBe(true)
    if (msRes.ok) {
      expect(msRes.data[0].etapa).toBe('Iniciada')
      expect(msRes.data[0].completado).toBe(true)
    }

    // 4. Checklist documental inicial
    const docsRes = await getOperationDocuments(op.id)
    expect(docsRes.ok).toBe(true)
    if (!docsRes.ok) return
    expect(docsRes.data.length).toBeGreaterThan(0)
    const docDni = docsRes.data.find((d) => d.codigoRequisito === 'dni_comprador')
    expect(docDni).toBeDefined()

    // 5. Carga segura de versión documental (GAM3-004)
    const uploadRes = await uploadDocumentVersion(op.id, docDni!.id, {
      archivoNombre: 'dni_comprador_demo.pdf',
      tamanoBytes: 512000,
      mimeType: 'application/pdf',
    })
    expect(uploadRes.ok).toBe(true)
    if (uploadRes.ok) {
      expect(uploadRes.data.version).toBe(1)
    }

    // 6. Solicitud de signed URL temporal de descarga (GAM3-003)
    const accessRes = await getDocumentAccessLink(docDni!.id)
    expect(accessRes.ok).toBe(true)
    if (accessRes.ok) {
      expect(accessRes.data.urlAccesoTemporal).toContain('https://')
      expect(accessRes.data.expiraEn).toBeDefined()
    }

    // 7. Data Scope Aislamiento (GAM3-007 / GAM3-008):
    // Verificamos que el filtrado de scope opera correctamente
    const buyerDocsRes = await getOperationDocuments('op-1', 'comprador')
    expect(buyerDocsRes.ok).toBe(true)
    if (buyerDocsRes.ok) {
      const tieneDocPrivadoPropietario = buyerDocsRes.data.some(
        (d) => d.codigoRequisito === 'hr_pu_municipal'
      )
      expect(tieneDocPrivadoPropietario).toBe(false)
    }

    // 8. Estado de contrato operativo
    const contractRes = await getContractStatus('op-1')
    expect(contractRes.ok).toBe(true)
    if (contractRes.ok) {
      expect(contractRes.data.numeroReferencia).toBeDefined()
    }

    // 9. Obligaciones y pagos
    const oblRes = await getOperationObligations('op-1')
    expect(oblRes.ok).toBe(true)
    const payRes = await getOperationPayments('op-1')
    expect(payRes.ok).toBe(true)
  })
})
