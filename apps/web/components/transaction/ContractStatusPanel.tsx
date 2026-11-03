'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ContractStatus } from '@/types'
import { getContractStatus } from '@/lib/api-transaction'
import LoadingRows from '@/components/commercial/LoadingRows'

export default function ContractStatusPanel({ operationId }: { operationId: string }) {
  const [status, setStatus] = useState<ContractStatus | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const res = await getContractStatus(operationId)
    if (res.ok) {
      setStatus(res.data)
    }
    setCargando(false)
  }, [operationId])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando) return <LoadingRows rows={2} />

  if (!status) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-low p-6 text-center font-hanken text-xs text-on-surface-variant">
        No hay registro de contrato emitido para esta operación.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant/60 pb-4">
        <div>
          <span className="font-hanken text-[11px] font-semibold uppercase tracking-wider text-primary">
            Estado de Minuta / Contrato
          </span>
          <p className="mt-0.5 font-syne text-lg font-bold text-on-surface">
            {status.numeroReferencia}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 font-hanken text-xs font-semibold text-primary">
          {status.estado}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Notaría Asignada</p>
          <p className="mt-1 font-syne text-sm font-semibold text-on-surface">
            {status.notariaAsignada || 'Por designar'}
          </p>
        </div>

        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Fecha Objetivo de Firma</p>
          <p className="mt-1 font-syne text-sm font-semibold text-on-surface">
            {status.fechaObjetivoFirma
              ? new Intl.DateTimeFormat('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(`${status.fechaObjetivoFirma}T00:00:00`))
              : 'Por coordinar'}
          </p>
        </div>
      </div>

      {status.observaciones && (
        <div className="mt-4 rounded-lg bg-surface-mid p-3 font-hanken text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">Observaciones:</strong> {status.observaciones}
        </div>
      )}

      {/* Aviso explícito de alcance operativo (GAM3-005) */}
      <div className="mt-6 border-t border-outline-variant/40 pt-3 font-hanken text-[11px] text-on-surface-variant/80 italic">
        ⚠️ Aviso: Este panel es un registro operativo de estado y no constituye asesoría jurídica ni editor legal de contratos.
      </div>
    </div>
  )
}
