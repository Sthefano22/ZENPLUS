'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'
import { createOfertaVersion } from '@/lib/api-commercial'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

type Estado = 'idle' | 'enviando' | 'creada' | 'error'

export default function OfertaVersionForm({
  opportunityId,
  versionAnterior,
  onCreada,
}: {
  opportunityId: string
  versionAnterior: number
  onCreada: () => void
}) {
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState<'USD' | 'PEN'>('USD')
  const [condiciones, setCondiciones] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<Estado>('idle')

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!monto || Number(monto) <= 0) e.monto = 'Ingresa un monto mayor a 0.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setEstado('enviando')
    const res = await createOfertaVersion(opportunityId, {
      monto: Number(monto),
      moneda,
      condiciones: condiciones.trim() || undefined,
      creadoEn: new Date().toISOString(),
      creadoPor: 'Asesor ZENPLUS',
    })
    setEstado(res.ok ? 'creada' : 'error')
    if (res.ok) onCreada()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="font-hanken text-xs text-on-surface-variant">Versión anterior: {versionAnterior}</p>

      <div className="grid grid-cols-[1fr_120px] gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="monto" className="font-hanken text-[13px] text-on-surface-variant">
            Monto
          </label>
          <input
            id="monto"
            type="number"
            aria-required="true"
            className={inputClass}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="1500000"
          />
          {errores.monto && (
            <p aria-live="polite" className="font-hanken text-xs text-error">
              {errores.monto}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="moneda" className="font-hanken text-[13px] text-on-surface-variant">
            Moneda
          </label>
          <select
            id="moneda"
            className={inputClass}
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as 'USD' | 'PEN')}
          >
            <option value="USD">USD</option>
            <option value="PEN">PEN</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="condiciones" className="font-hanken text-[13px] text-on-surface-variant">
          Condiciones (opcional)
        </label>
        <textarea
          id="condiciones"
          rows={3}
          className={inputClass}
          value={condiciones}
          onChange={(e) => setCondiciones(e.target.value)}
          placeholder="Forma de pago, plazos, etc."
        />
      </div>

      {estado === 'error' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          No se pudo crear la nueva versión. Intenta nuevamente.
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
        {estado === 'enviando' ? 'Enviando...' : 'Crear nueva versión'}
      </motion.button>
    </form>
  )
}
