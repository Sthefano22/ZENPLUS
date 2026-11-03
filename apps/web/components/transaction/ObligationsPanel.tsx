'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Obligation, Payment } from '@/types'
import { getOperationObligations, getOperationPayments } from '@/lib/api-transaction'
import { trackEvent } from '@/lib/analytics'
import LoadingRows from '@/components/commercial/LoadingRows'

function formatearMonto(monto: number, moneda: string): string {
  return `${moneda} $${new Intl.NumberFormat('en-US').format(monto)}`
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))
}

const ESTADOS_OBL_BADGE = {
  Pagado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Parcial: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Pendiente: 'bg-neutral-500/15 text-on-surface-variant border-outline-variant',
  Vencido: 'bg-error/15 text-error border-error/30',
}

export default function ObligationsPanel({ operationId }: { operationId: string }) {
  const [obligaciones, setObligaciones] = useState<Obligation[]>([])
  const [pagos, setPagos] = useState<Payment[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    const [oblRes, payRes] = await Promise.all([
      getOperationObligations(operationId),
      getOperationPayments(operationId),
    ])

    if (oblRes.ok) setObligaciones(oblRes.data)
    if (payRes.ok) setPagos(payRes.data)

    trackEvent('obligation_viewed', { operationId })
    setCargando(false)
  }, [operationId])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando) return <LoadingRows rows={3} />

  const totalMonto = obligaciones.reduce((acc, o) => acc + o.monto, 0)
  const totalPagado = obligaciones.reduce((acc, o) => acc + o.montoPagado, 0)
  const moneda = obligaciones[0]?.moneda || 'USD'

  return (
    <div className="space-y-6">
      {/* Resumen Financiero Consolidado */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-outline-variant bg-surface-low p-6 sm:grid-cols-3">
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Monto Total de la Operación</p>
          <p className="mt-1 font-syne text-xl font-bold text-on-surface">
            {formatearMonto(totalMonto, moneda)}
          </p>
        </div>

        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Total Abonado y Verificado</p>
          <p className="mt-1 font-syne text-xl font-bold text-emerald-400">
            {formatearMonto(totalPagado, moneda)}
          </p>
        </div>

        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Saldo Pendiente de Pago</p>
          <p className="mt-1 font-syne text-xl font-bold text-primary">
            {formatearMonto(totalMonto - totalPagado, moneda)}
          </p>
        </div>
      </div>

      {/* Lista de Obligaciones Financieras */}
      <div>
        <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-on-surface">
          Cronograma de Obligaciones
        </h3>
        <ul className="mt-3 flex flex-col gap-3">
          {obligaciones.map((obl) => (
            <li
              key={obl.id}
              className="rounded-xl border border-outline-variant bg-surface-low p-5 transition-all hover:border-outline"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-syne text-sm font-semibold text-on-surface">{obl.concepto}</p>
                  <p className="mt-1 font-hanken text-xs text-on-surface-variant">
                    Vencimiento: {formatearFecha(obl.fechaVencimiento)} · Responsable:{' '}
                    <strong className="capitalize">{obl.rolResponsable}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-syne text-base font-bold text-on-surface">
                      {formatearMonto(obl.monto, obl.moneda)}
                    </p>
                    {obl.montoPagado > 0 && obl.montoPagado < obl.monto && (
                      <p className="font-hanken text-[11px] text-emerald-400">
                        Abonado: {formatearMonto(obl.montoPagado, obl.moneda)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-hanken text-[11px] font-semibold ${
                      ESTADOS_OBL_BADGE[obl.estado]
                    }`}
                  >
                    {obl.estado}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Historial de Pagos Verificados */}
      {pagos.length > 0 && (
        <div>
          <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-on-surface">
            Pagos Aplicados y Comprobantes
          </h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {pagos.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-mid px-4 py-3"
              >
                <div>
                  <p className="font-hanken text-xs font-semibold text-on-surface">
                    {p.metodoPago} · Ref: {p.numeroOperacion}
                  </p>
                  <p className="font-hanken text-[11px] text-on-surface-variant">
                    Fecha de abono: {formatearFecha(p.fechaPago)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-syne text-sm font-bold text-emerald-400">
                    +{formatearMonto(p.monto, p.moneda)}
                  </span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-hanken text-[10px] font-semibold text-emerald-400">
                    {p.estado}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
