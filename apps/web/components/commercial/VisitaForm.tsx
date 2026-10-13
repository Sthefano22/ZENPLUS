'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'
import { createVisita } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

type Estado = 'idle' | 'enviando' | 'creada' | 'error'

export default function VisitaForm({
  opportunityId,
  onCreada,
}: {
  opportunityId: string
  onCreada: () => void
}) {
  const [propiedadSlug, setPropiedadSlug] = useState('')
  const [propiedadTitulo, setPropiedadTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [asesorNombre, setAsesorNombre] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<Estado>('idle')

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!propiedadSlug.trim()) e.propiedadSlug = 'Ingresa el slug de la propiedad.'
    if (!propiedadTitulo.trim()) e.propiedadTitulo = 'Ingresa el título de la propiedad.'
    if (!fecha) {
      e.fecha = 'Selecciona una fecha.'
    } else {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const fechaSeleccionada = new Date(`${fecha}T00:00:00`)
      if (fechaSeleccionada < hoy) e.fecha = 'La fecha no puede ser en el pasado.'
    }
    if (!hora) e.hora = 'Selecciona una hora.'
    if (!asesorNombre.trim()) e.asesorNombre = 'Ingresa el nombre del asesor.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setEstado('enviando')
    const res = await createVisita({
      opportunityId,
      propiedadSlug: propiedadSlug.trim(),
      propiedadTitulo: propiedadTitulo.trim(),
      fecha,
      hora,
      asesorNombre: asesorNombre.trim(),
      estado: 'Programada',
    })
    setEstado(res.ok ? 'creada' : 'error')
    if (res.ok) {
      trackEvent('visit_form_submitted', { opportunityId, propiedadSlug: propiedadSlug.trim() })
      setPropiedadSlug('')
      setPropiedadTitulo('')
      setFecha('')
      setHora('')
      setAsesorNombre('')
      onCreada()
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="propiedadSlug" className="font-hanken text-[13px] text-on-surface-variant">
          Slug de propiedad
        </label>
        <input
          id="propiedadSlug"
          aria-required="true"
          className={inputClass}
          value={propiedadSlug}
          onChange={(e) => setPropiedadSlug(e.target.value)}
          placeholder="sky-penthouse-reserve"
        />
        {errores.propiedadSlug && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.propiedadSlug}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="propiedadTitulo" className="font-hanken text-[13px] text-on-surface-variant">
          Título de propiedad
        </label>
        <input
          id="propiedadTitulo"
          aria-required="true"
          className={inputClass}
          value={propiedadTitulo}
          onChange={(e) => setPropiedadTitulo(e.target.value)}
          placeholder="Sky Penthouse Reserve"
        />
        {errores.propiedadTitulo && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.propiedadTitulo}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fecha" className="font-hanken text-[13px] text-on-surface-variant">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            aria-required="true"
            className={inputClass}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {errores.fecha && (
            <p aria-live="polite" className="font-hanken text-xs text-error">
              {errores.fecha}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="hora" className="font-hanken text-[13px] text-on-surface-variant">
            Hora
          </label>
          <input
            id="hora"
            type="time"
            aria-required="true"
            className={inputClass}
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
          {errores.hora && (
            <p aria-live="polite" className="font-hanken text-xs text-error">
              {errores.hora}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="asesorNombre" className="font-hanken text-[13px] text-on-surface-variant">
          Asesor
        </label>
        <input
          id="asesorNombre"
          aria-required="true"
          className={inputClass}
          value={asesorNombre}
          onChange={(e) => setAsesorNombre(e.target.value)}
          placeholder="Nombre del asesor"
        />
        {errores.asesorNombre && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.asesorNombre}
          </p>
        )}
      </div>

      {estado === 'error' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          No se pudo programar la visita. Intenta nuevamente.
        </p>
      )}
      {estado === 'creada' && (
        <p aria-live="polite" className="font-hanken text-sm text-primary">
          Visita programada.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={estado === 'enviando'}
        aria-disabled={estado === 'enviando'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-1 self-start rounded-full bg-primary px-6 py-3.5 font-hanken text-[15px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Programando...' : 'Programar visita'}
      </motion.button>
    </form>
  )
}
