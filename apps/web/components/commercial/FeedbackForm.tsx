'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'
import { updateVisita } from '@/lib/api-commercial'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

type Estado = 'idle' | 'guardando' | 'guardado' | 'error'
type Interes = 'Alto' | 'Medio' | 'Bajo' | 'Sin interés'

export default function FeedbackForm({
  visitaId,
  onGuardado,
}: {
  visitaId: string
  onGuardado: () => void
}) {
  const [feedback, setFeedback] = useState('')
  const [interes, setInteres] = useState<Interes | ''>('')
  const [siguienteAccion, setSiguienteAccion] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<Estado>('idle')

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!feedback.trim()) e.feedback = 'Ingresa el feedback de la visita.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setEstado('guardando')
    const res = await updateVisita(visitaId, {
      feedback: feedback.trim(),
      interes: interes || undefined,
      siguienteAccion: siguienteAccion.trim() || undefined,
    })
    setEstado(res.ok ? 'guardado' : 'error')
    if (res.ok) onGuardado()
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-mid p-5"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback" className="font-hanken text-[13px] text-on-surface-variant">
          Feedback
        </label>
        <textarea
          id="feedback"
          rows={3}
          aria-required="true"
          className={inputClass}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="¿Cómo fue la visita?"
        />
        {errores.feedback && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.feedback}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="interes" className="font-hanken text-[13px] text-on-surface-variant">
          Nivel de interés
        </label>
        <select
          id="interes"
          className={inputClass}
          value={interes}
          onChange={(e) => setInteres(e.target.value as Interes)}
        >
          <option value="">Seleccionar...</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Bajo">Bajo</option>
          <option value="Sin interés">Sin interés</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="siguienteAccion" className="font-hanken text-[13px] text-on-surface-variant">
          Siguiente acción (opcional)
        </label>
        <textarea
          id="siguienteAccion"
          rows={2}
          className={inputClass}
          value={siguienteAccion}
          onChange={(e) => setSiguienteAccion(e.target.value)}
          placeholder="¿Qué sigue con este cliente?"
        />
      </div>

      {estado === 'error' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          No se pudo guardar el feedback. Intenta nuevamente.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={estado === 'guardando'}
        aria-disabled={estado === 'guardando'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="self-start rounded-full bg-primary px-6 py-3 font-hanken text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'guardando' ? 'Guardando...' : 'Guardar feedback'}
      </motion.button>
    </form>
  )
}
