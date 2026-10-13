'use client'

import { useCallback, useEffect, useState } from 'react'
import { getOfertaThread } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'
import OfertaBadge from './OfertaBadge'
import EmptyState from './EmptyState'
import LoadingRows from './LoadingRows'
import OfertaVersionForm from './OfertaVersionForm'
import type { OfertaThread } from '@/types'

const ESTADOS_CON_NUEVA_VERSION: OfertaThread['estado'][] = ['Borrador', 'En Negociación', 'Contraoferta']

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

export default function OfertaWorkspace({ opportunityId }: { opportunityId: string }) {
  const [thread, setThread] = useState<OfertaThread | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

  const cargar = useCallback(() => {
    setCargando(true)
    getOfertaThread(opportunityId).then((data) => {
      setThread(data)
      setCargando(false)
    })
  }, [opportunityId])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando) return <LoadingRows rows={3} />

  if (!thread) {
    return (
      <EmptyState
        titulo="Sin ofertas activas"
        descripcion="Todavía no se ha iniciado un proceso de oferta para esta opportunity."
      />
    )
  }

  const puedeNuevaVersion = ESTADOS_CON_NUEVA_VERSION.includes(thread.estado)
  const ultimaVersion = thread.versiones[thread.versiones.length - 1]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-outline-variant bg-surface-low p-5">
        <div>
          <p className="font-syne text-base font-semibold text-on-surface">{thread.propiedadTitulo}</p>
          <p className="mt-1 font-hanken text-xs text-on-surface-variant">
            Última actualización: {formatearFecha(thread.actualizadoEn)}
          </p>
        </div>
        <OfertaBadge estado={thread.estado} />
      </div>

      <ul className="flex flex-col gap-3">
        {thread.versiones.map((v) => (
          <li key={v.version} className="rounded-xl border border-outline-variant bg-surface-mid p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Versión {v.version}
              </p>
              <p className="font-syne text-lg font-semibold text-primary">{formatearMonto(v.monto, v.moneda)}</p>
            </div>
            {v.condiciones && <p className="mt-2 font-hanken text-sm text-on-surface-variant">{v.condiciones}</p>}
            <p className="mt-2 font-hanken text-xs text-on-surface-variant">
              {formatearFecha(v.creadoEn)} · {v.creadoPor}
            </p>
          </li>
        ))}
      </ul>

      {puedeNuevaVersion && !mostrarForm && (
        <button
          type="button"
          onClick={() => {
            trackEvent('offer_action_clicked', {
              opportunityId,
              propiedadSlug: thread.propiedadSlug,
              estado: thread.estado,
              accion: 'nueva_version',
            })
            setMostrarForm(true)
          }}
          className="self-start rounded-full bg-primary px-6 py-3 font-hanken text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Nueva versión
        </button>
      )}

      {puedeNuevaVersion && mostrarForm && (
        <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
          <OfertaVersionForm
            opportunityId={opportunityId}
            versionAnterior={ultimaVersion.version}
            onCreada={() => {
              setMostrarForm(false)
              cargar()
            }}
          />
        </div>
      )}
    </div>
  )
}
