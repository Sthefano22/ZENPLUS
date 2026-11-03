'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { uploadDocumentVersion } from '@/lib/api-transaction'
import { trackEvent } from '@/lib/analytics'
import type { DocumentItem } from '@/types'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png']

interface DocumentUploadModalProps {
  operationId: string
  documento: DocumentItem
  onCerrar: () => void
  onExito: () => void
}

export default function DocumentUploadModal({
  operationId,
  documento,
  onCerrar,
  onExito,
}: DocumentUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validarArchivo(f: File): boolean {
    setError(null)
    if (!ALLOWED_MIME.includes(f.type)) {
      setError('Formato no permitido. Solo se aceptan archivos PDF, JPG o PNG.')
      return false
    }
    if (f.size > MAX_BYTES) {
      setError('El archivo excede el tamaño máximo permitido de 10 MB.')
      return false
    }
    return true
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f && validarArchivo(f)) {
      setArchivo(f)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastrando(false)
    const f = e.dataTransfer.files?.[0]
    if (f && validarArchivo(f)) {
      setArchivo(f)
    }
  }

  async function iniciarSubida() {
    if (!archivo || subiendo) return

    setSubiendo(true)
    setError(null)
    setProgreso(15)

    // Evento de inicio seguro (sin PII ni nombre de archivo)
    trackEvent('document_upload_started', {
      operationId,
      documentType: documento.codigoRequisito,
    })

    // Simular progreso de subida con XHR o timers seguros
    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 85) {
          clearInterval(intervalo)
          return prev
        }
        return prev + 25
      })
    }, 200)

    try {
      const res = await uploadDocumentVersion(operationId, documento.id, {
        archivoNombre: archivo.name,
        tamanoBytes: archivo.size,
        mimeType: archivo.type,
      })

      clearInterval(intervalo)

      if (res.ok) {
        setProgreso(100)
        trackEvent('document_upload_completed', {
          operationId,
          documentType: documento.codigoRequisito,
          version: res.data.version,
        })
        setTimeout(() => {
          onExito()
        }, 400)
      } else {
        setSubiendo(false)
        setProgreso(0)
        setError(res.message || 'No fue posible completar la subida. Puede reintentar.')
      }
    } catch {
      clearInterval(intervalo)
      setSubiendo(false)
      setProgreso(0)
      setError('Error de conexión al cargar el documento. Intente nuevamente.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-low p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
          <div>
            <h3 id="modal-title" className="font-syne text-base font-bold text-on-surface">
              Cargar Documento
            </h3>
            <p className="font-hanken text-xs text-on-surface-variant">{documento.titulo}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={subiendo}
            aria-label="Cerrar modal"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Zona Drag & Drop */}
        <div
          role="region"
          aria-label="Área de arrastre de archivos"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            arrastrando
              ? 'border-primary bg-primary/10'
              : 'border-outline-variant bg-surface-mid hover:border-outline'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          <span className="text-3xl">📄</span>
          <p className="mt-2 font-syne text-xs font-bold text-on-surface">
            {archivo ? archivo.name : 'Haz clic o arrastra tu archivo aquí'}
          </p>
          <p className="mt-1 font-hanken text-[11px] text-on-surface-variant">
            Formatos admitidos: PDF, JPG, PNG · Tamaño máx: 10 MB
          </p>
        </div>

        {/* Barra de progreso */}
        {subiendo && (
          <div className="mt-4">
            <div className="flex justify-between font-hanken text-xs text-on-surface-variant">
              <span>Subiendo archivo seguro...</span>
              <span>{progreso}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-mid">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}

        {/* Mensaje de error seguro */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-error/30 bg-error/10 p-3 font-hanken text-xs text-error"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-outline-variant/60 pt-4">
          <button
            type="button"
            onClick={onCerrar}
            disabled={subiendo}
            className="rounded-full border border-outline-variant px-4 py-2 font-hanken text-xs font-semibold text-on-surface hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!archivo || subiendo}
            onClick={iniciarSubida}
            className="rounded-full bg-primary px-5 py-2 font-hanken text-xs font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {subiendo ? 'Cargando...' : 'Confirmar y Subir'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
