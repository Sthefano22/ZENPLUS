'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'
import { createReserva } from '@/lib/api-commercial'
import { trackEvent } from '@/lib/analytics'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

type Estado = 'idle' | 'enviando' | 'creada' | 'error' | 'conflicto'

function calcularExpiracion(): Date {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 7)
  return fecha
}

export default function ReservaForm({
  opportunityId,
  onCreada,
}: {
  opportunityId: string
  onCreada: () => void
}) {
  const [propiedadSlug, setPropiedadSlug] = useState('')
  const [propiedadTitulo, setPropiedadTitulo] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState<'USD' | 'PEN'>('USD')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<Estado>('idle')

  const expiracion = calcularExpiracion()

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!propiedadSlug.trim()) e.propiedadSlug = 'Ingresa el slug de la propiedad.'
    if (!propiedadTitulo.trim()) e.propiedadTitulo = 'Ingresa el título de la propiedad.'
    if (!monto || Number(monto) <= 0) e.monto = 'Ingresa un monto mayor a 0.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setEstado('enviando')
    const res = await createReserva({
      opportunityId,
      propiedadSlug: propiedadSlug.trim(),
      propiedadTitulo: propiedadTitulo.trim(),
      monto: Number(monto),
      moneda,
      estado: 'Activa',
      expiraEn: expiracion.toISOString(),
      creadoEn: new Date().toISOString(),
    })

    if (res.conflicto) {
      setEstado('conflicto')
      return
    }
    setEstado(res.ok ? 'creada' : 'error')
    if (res.ok) {
      trackEvent('reservation_action_clicked', {
        opportunityId,
        propiedadSlug: propiedadSlug.trim(),
        accion: 'crear_reserva',
      })
      onCreada()
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="reservaPropiedadSlug" className="font-hanken text-[13px] text-on-surface-variant">
          Slug de propiedad
        </label>
        <input
          id="reservaPropiedadSlug"
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
        <label htmlFor="reservaPropiedadTitulo" className="font-hanken text-[13px] text-on-surface-variant">
          Título de propiedad
        </label>
        <input
          id="reservaPropiedadTitulo"
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

      <div className="grid grid-cols-[1fr_120px] gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="reservaMonto" className="font-hanken text-[13px] text-on-surface-variant">
            Monto
          </label>
          <input
            id="reservaMonto"
            type="number"
            aria-required="true"
            className={inputClass}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="50000"
          />
          {errores.monto && (
            <p aria-live="polite" className="font-hanken text-xs text-error">
              {errores.monto}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="reservaMoneda" className="font-hanken text-[13px] text-on-surface-variant">
            Moneda
          </label>
          <select
            id="reservaMoneda"
            className={inputClass}
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as 'USD' | 'PEN')}
          >
            <option value="USD">USD</option>
            <option value="PEN">PEN</option>
          </select>
        </div>
      </div>

      <p className="font-hanken text-xs text-on-surface-variant">
        Esta reserva expirará automáticamente el{' '}
        <span className="font-semibold text-on-surface">
          {new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(expiracion)}
        </span>{' '}
        (7 días desde hoy).
      </p>

      {estado === 'error' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          No se pudo crear la reserva. Intenta nuevamente.
        </p>
      )}
      {estado === 'conflicto' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          Esta propiedad ya tiene una reserva activa.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={estado === 'enviando'}
        aria-disabled={estado === 'enviando'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="self-start rounded-full bg-primary px-6 py-3 font-hanken text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Creando...' : 'Crear reserva'}
      </motion.button>
    </form>
  )
}
