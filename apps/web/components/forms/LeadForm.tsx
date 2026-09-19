'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { validarFormularioConsulta } from '@/lib/validators'
import { submitLead } from '@/lib/api'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

export default function LeadForm({ propiedadRef }: { propiedadRef?: string }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'enviado' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validacion = validarFormularioConsulta({ nombre, email, telefono, mensaje })
    setErrores(validacion.errores)
    if (!validacion.valido) return

    setEstado('enviando')
    const res = await submitLead({ nombre, email, telefono, mensaje, propiedadRef })
    setEstado(res.ok ? 'enviado' : 'error')
  }

  if (estado === 'enviado') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-outline-variant bg-surface-low p-8 text-center"
      >
        <h3 className="font-syne text-lg font-semibold text-primary">Consulta enviada</h3>
        <p className="mt-2 font-hanken text-sm text-on-surface-variant">
          Un asesor ZENPLUS se pondrá en contacto contigo en menos de 24 horas.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="nombre" className="font-hanken text-[13px] text-on-surface-variant">
          Nombre completo
        </label>
        <input id="nombre" className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        <AnimatePresence>
          {errores.nombre && (
            <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden font-hanken text-xs text-error">
              {errores.nombre}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-hanken text-[13px] text-on-surface-variant">
          Correo electrónico
        </label>
        <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
        <AnimatePresence>
          {errores.email && (
            <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden font-hanken text-xs text-error">
              {errores.email}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="telefono" className="font-hanken text-[13px] text-on-surface-variant">
          Celular (opcional)
        </label>
        <input id="telefono" className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+51 9XX XXX XXX" />
        <AnimatePresence>
          {errores.telefono && (
            <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden font-hanken text-xs text-error">
              {errores.telefono}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mensaje" className="font-hanken text-[13px] text-on-surface-variant">
          Mensaje
        </label>
        <textarea id="mensaje" rows={4} className={inputClass} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Cuéntanos qué estás buscando..." />
        <AnimatePresence>
          {errores.mensaje && (
            <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden font-hanken text-xs text-error">
              {errores.mensaje}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {estado === 'error' && <p className="font-hanken text-sm text-error">No se pudo enviar tu consulta. Intenta nuevamente.</p>}

      <motion.button
        type="submit"
        disabled={estado === 'enviando'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-1 rounded-full bg-primary px-6 py-4 font-hanken text-[15px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando...' : 'Enviar consulta'}
      </motion.button>
    </form>
  )
}
