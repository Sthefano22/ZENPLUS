'use client'

import { useState, useCallback, useEffect } from 'react'
import type { DocumentItem, RolParte, EstadoDocumento } from '@/types'
import { getOperationDocuments, getDocumentAccessLink } from '@/lib/api-transaction'
import { trackEvent } from '@/lib/analytics'
import DocumentUploadModal from './DocumentUploadModal'
import LoadingRows from '@/components/commercial/LoadingRows'
import EmptyState from '@/components/commercial/EmptyState'

const ESTADOS_DOC_BADGE: Record<EstadoDocumento, string> = {
  Pendiente: 'bg-neutral-500/10 text-on-surface-variant border-outline-variant',
  Cargado: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'En revisión': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Aprobado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rechazado: 'bg-error/15 text-error border-error/30',
  Vencido: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

interface DocumentCenterProps {
  operationId: string
  roleScope?: RolParte
  puedeSubir?: boolean
}

export default function DocumentCenter({
  operationId,
  roleScope,
  puedeSubir = true,
}: DocumentCenterProps) {
  const [documentos, setDocumentos] = useState<DocumentItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [documentoParaSubir, setDocumentoParaSubir] = useState<DocumentItem | null>(null)
  const [descargandoId, setDescargandoId] = useState<string | null>(null)
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    const res = await getOperationDocuments(operationId, roleScope)
    if (res.ok) {
      setDocumentos(res.data)
    }
    setCargando(false)
  }, [operationId, roleScope])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function handleDescargar(doc: DocumentItem) {
    if (!doc.versiones.length) return
    setDescargandoId(doc.id)
    setErrorDescarga(null)

    // Solicitar signed URL de corta duración bajo demanda (GAM3-003)
    const res = await getDocumentAccessLink(doc.id)
    setDescargandoId(null)

    if (res.ok && res.data.urlAccesoTemporal) {
      window.open(res.data.urlAccesoTemporal, '_blank', 'noopener,noreferrer')
      trackEvent('document_status_viewed', {
        operationId,
        documentId: doc.id,
        status: doc.estado,
      })
    } else {
      setErrorDescarga('El enlace de descarga temporal no pudo ser generado. Intente nuevamente.')
    }
  }

  if (cargando) return <LoadingRows rows={3} />

  if (documentos.length === 0) {
    return (
      <EmptyState
        titulo="Sin requisitos documentales"
        descripcion="No se encontraron requisitos documentales configurados para esta etapa."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-on-surface">
            Checklist y Centro de Documentación
          </h3>
          <p className="font-hanken text-xs text-on-surface-variant">
            Documentos auditados y custodiados bajo cifrado seguro.
          </p>
        </div>
      </div>

      {errorDescarga && (
        <div
          role="alert"
          className="rounded-lg border border-error/30 bg-error/10 p-3 font-hanken text-xs text-error"
        >
          {errorDescarga}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {documentos.map((doc) => {
          const tieneVersiones = doc.versiones.length > 0
          const ultimaVersion = tieneVersiones ? doc.versiones[doc.versiones.length - 1] : null

          return (
            <li
              key={doc.id}
              className="rounded-xl border border-outline-variant bg-surface-low p-4 sm:p-5 transition-all hover:border-outline"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-syne text-sm font-semibold text-on-surface">
                      {doc.titulo}
                    </span>
                    {doc.obligatorio && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-hanken text-[10px] font-semibold text-primary">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  {doc.descripcion && (
                    <p className="mt-1 font-hanken text-xs text-on-surface-variant leading-relaxed">
                      {doc.descripcion}
                    </p>
                  )}

                  {doc.motivoRechazo && (
                    <div className="mt-2 rounded-lg bg-error/10 p-2 font-hanken text-xs text-error">
                      Motivo de rechazo: {doc.motivoRechazo}
                    </div>
                  )}

                  {ultimaVersion && (
                    <p className="mt-2 font-hanken text-[11px] text-on-surface-variant">
                      Versión {ultimaVersion.version} · Subido por {ultimaVersion.subidoPor} ·{' '}
                      {(ultimaVersion.tamanoBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-2.5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 font-hanken text-[11px] font-semibold ${
                      ESTADOS_DOC_BADGE[doc.estado]
                    }`}
                  >
                    {doc.estado}
                  </span>

                  <div className="flex items-center gap-2">
                    {tieneVersiones && (
                      <button
                        type="button"
                        disabled={descargandoId === doc.id}
                        onClick={() => handleDescargar(doc)}
                        className="rounded-full border border-outline-variant px-3 py-1 font-hanken text-xs font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
                      >
                        {descargandoId === doc.id ? 'Generando enlace...' : 'Descargar Archivo'}
                      </button>
                    )}

                    {puedeSubir && (
                      <button
                        type="button"
                        onClick={() => setDocumentoParaSubir(doc)}
                        className="rounded-full bg-primary/15 border border-primary/30 px-3 py-1 font-hanken text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
                      >
                        {tieneVersiones ? 'Subir Nueva Versión' : 'Cargar Documento'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {documentoParaSubir && (
        <DocumentUploadModal
          operationId={operationId}
          documento={documentoParaSubir}
          onCerrar={() => setDocumentoParaSubir(null)}
          onExito={() => {
            setDocumentoParaSubir(null)
            cargar()
          }}
        />
      )}
    </div>
  )
}
