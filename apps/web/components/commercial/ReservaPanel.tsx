'use client'

import { useCallback, useEffect, useState } from 'react'
import { getReserva } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'
import ReservaForm from './ReservaForm'
import EmptyState from './EmptyState'
import LoadingRows from './LoadingRows'
import type { Reserva } from '@/types'

const ESTILOS: Record<Reserva['estado'], string> = {
  Activa: 'bg-primary text-on-primary',
  Expirada: 'bg-error/15 text-error',
  Cancelada: 'bg-white/5 text-on-surface-variant border border-outline-variant',
  Convertida: 'bg-primary-container/20 text-primary-container border border-outline-variant',
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function formatearMonto(monto: number, moneda: string): string {
  return `${moneda} $${new Intl.NumberFormat('en-US').format(monto)}`
}

export default function ReservaPanel({ opportunityId }: { opportunityId: string }) {
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

  const cargar = useCallback(() => {
    setCargando(true)
    getReserva(opportunityId).then((data) => {
      setReserva(data)
      setCargando(false)
    })
  }, [opportunityId])

  useEffect(() => {
    cargar()
  }, [cargar])

  function abrirFormulario() {
    trackEvent('reservation_action_clicked', { opportunityId, accion: 'abrir_formulario' })
    setMostrarForm(true)
  }

  if (cargando) return <LoadingRows rows={2} />

  if (!reserva || mostrarForm) {
    if (!reserva && !mostrarForm) {
      return (
        <EmptyState
          titulo="Sin reserva"
          descripcion="Esta opportunity todavía no tiene una reserva activa."
          accion={{ label: 'Crear reserva', onClick: abrirFormulario }}
        />
      )
    }
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
        <ReservaForm
          opportunityId={opportunityId}
          onCreada={() => {
            setMostrarForm(false)
            cargar()
          }}
        />
      </div>
    )
  }

  const expiraPronto =
    reserva.estado === 'Activa' && new Date(reserva.expiraEn).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-syne text-base font-semibold text-on-surface">{reserva.propiedadTitulo}</p>
          <p className="mt-1 font-syne text-xl font-semibold text-primary">
            {formatearMonto(reserva.monto, reserva.moneda)}
          </p>
          <p className="mt-2 font-hanken text-xs text-on-surface-variant">Expira: {formatearFecha(reserva.expiraEn)}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${ESTILOS[reserva.estado]}`}
        >
          {reserva.estado}
        </span>
      </div>

      {expiraPronto && (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 font-hanken text-sm text-error"
        >
          ⚠️ Esta reserva expira pronto
        </p>
      )}

      {reserva.estado === 'Expirada' && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          <p className="font-hanken text-sm text-on-surface-variant">Esta reserva expiró.</p>
          <button
            type="button"
            onClick={abrirFormulario}
            className="mt-3 rounded-full border border-outline-variant px-4 py-2 font-hanken text-xs font-semibold text-primary transition-colors hover:border-primary"
          >
            Crear nueva reserva
          </button>
        </div>
      )}

      {reserva.estado === 'Cancelada' && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          <p className="font-hanken text-sm text-on-surface-variant">Esta reserva fue cancelada.</p>
          <button
            type="button"
            onClick={abrirFormulario}
            className="mt-3 rounded-full border border-outline-variant px-4 py-2 font-hanken text-xs font-semibold text-primary transition-colors hover:border-primary"
          >
            Crear nueva reserva
          </button>
        </div>
      )}

      {reserva.estado === 'Convertida' && (
        <p className="mt-4 border-t border-outline-variant pt-4 font-hanken text-sm text-primary">
          Reserva convertida exitosamente. No se requieren más acciones.
        </p>
      )}
    </div>
  )
}
