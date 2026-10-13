'use client'

import { useCallback, useEffect, useState } from 'react'
import { getRequirement, getVisitas, getTimeline } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'
import LoadingRows from './LoadingRows'
import EmptyState from './EmptyState'
import CommercialTimeline from './CommercialTimeline'
import RequirementForm from './RequirementForm'
import VisitaCard from './VisitaCard'
import VisitaForm from './VisitaForm'
import FeedbackForm from './FeedbackForm'
import OfertaWorkspace from './OfertaWorkspace'
import ReservaPanel from './ReservaPanel'
import type { Requirement, Visita, TimelineEvento } from '@/types'

const TABS = ['Requirement', 'Visitas', 'Oferta', 'Reserva', 'Timeline'] as const
type Tab = (typeof TABS)[number]

export default function OpportunityTabs({ opportunityId }: { opportunityId: string }) {
  const [tab, setTab] = useState<Tab>('Requirement')
  const [cargando, setCargando] = useState(true)
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [timeline, setTimeline] = useState<TimelineEvento[]>([])
  const [visitaEnFeedback, setVisitaEnFeedback] = useState<string | null>(null)

  useEffect(() => {
    trackEvent('commercial_workspace_viewed', { opportunityId })
  }, [opportunityId])

  const cargarTodo = useCallback(async () => {
    setCargando(true)
    const [req, vis, tl] = await Promise.all([
      getRequirement(opportunityId),
      getVisitas(opportunityId),
      getTimeline(opportunityId),
    ])
    setRequirement(req)
    setVisitas(vis)
    setTimeline(tl)
    setCargando(false)
  }, [opportunityId])

  useEffect(() => {
    cargarTodo()
  }, [cargarTodo])

  return (
    <div className="mt-10">
      <div className="flex gap-1 overflow-x-auto border-b border-outline-variant">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-3 font-hanken text-sm font-semibold transition-colors ${
              tab === t ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'Requirement' &&
          (cargando ? (
            <LoadingRows rows={2} />
          ) : (
            <RequirementForm requirement={requirement} opportunityId={opportunityId} onSave={() => cargarTodo()} />
          ))}

        {tab === 'Visitas' && (
          <div className="flex flex-col gap-8">
            {cargando ? (
              <LoadingRows rows={2} />
            ) : visitas.length === 0 ? (
              <EmptyState titulo="Sin visitas" descripcion="Aún no se han programado visitas para esta opportunity." />
            ) : (
              <div className="flex flex-col gap-4">
                {visitas.map((v) => (
                  <div key={v.id} className="flex flex-col gap-3">
                    <VisitaCard visita={v} onRegistrarFeedback={() => setVisitaEnFeedback(v.id)} />
                    {visitaEnFeedback === v.id && (
                      <FeedbackForm
                        visitaId={v.id}
                        onGuardado={() => {
                          setVisitaEnFeedback(null)
                          cargarTodo()
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
              <h3 className="font-syne text-base font-semibold text-on-surface">Programar nueva visita</h3>
              <div className="mt-4">
                <VisitaForm opportunityId={opportunityId} onCreada={() => cargarTodo()} />
              </div>
            </div>
          </div>
        )}

        {tab === 'Oferta' && <OfertaWorkspace opportunityId={opportunityId} />}

        {tab === 'Reserva' && <ReservaPanel opportunityId={opportunityId} />}

        {tab === 'Timeline' &&
          (cargando ? (
            <LoadingRows rows={3} />
          ) : timeline.length === 0 ? (
            <EmptyState titulo="Sin actividad" descripcion="Todavía no hay eventos registrados para esta opportunity." />
          ) : (
            <CommercialTimeline eventos={timeline} />
          ))}
      </div>
    </div>
  )
}
