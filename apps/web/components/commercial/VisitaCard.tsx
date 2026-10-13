'use client'

import VisitaBadge from './VisitaBadge'
import type { Visita } from '@/types'

function formatearFecha(fecha: string, hora: string): string {
  const dt = new Date(`${fecha}T${hora}`)
  if (Number.isNaN(dt.getTime())) return `${fecha} ${hora}`
  return `${new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(dt)} · ${hora}`
}

export default function VisitaCard({
  visita,
  onRegistrarFeedback,
}: {
  visita: Visita
  onRegistrarFeedback?: () => void
}) {
  const puedeRegistrarFeedback = visita.estado === 'Realizada' && !visita.feedback

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-syne text-base font-semibold text-on-surface">{visita.propiedadTitulo}</p>
          <p className="mt-1 font-hanken text-sm text-on-surface-variant">
            {formatearFecha(visita.fecha, visita.hora)}
          </p>
          <p className="mt-0.5 font-hanken text-xs text-on-surface-variant">Asesor: {visita.asesorNombre}</p>
        </div>
        <VisitaBadge estado={visita.estado} />
      </div>

      {(visita.feedback || visita.interes) && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          {visita.interes && (
            <p className="font-hanken text-xs text-on-surface-variant">
              Interés: <span className="font-semibold text-on-surface">{visita.interes}</span>
            </p>
          )}
          {visita.feedback && <p className="mt-2 font-hanken text-sm text-on-surface-variant">{visita.feedback}</p>}
          {visita.siguienteAccion && (
            <p className="mt-2 font-hanken text-xs text-primary">Siguiente acción: {visita.siguienteAccion}</p>
          )}
        </div>
      )}

      {puedeRegistrarFeedback && onRegistrarFeedback && (
        <button
          type="button"
          onClick={onRegistrarFeedback}
          className="mt-4 rounded-full border border-outline-variant px-4 py-2 font-hanken text-xs font-semibold text-primary transition-colors hover:border-primary"
        >
          Registrar feedback
        </button>
      )}
    </div>
  )
}
