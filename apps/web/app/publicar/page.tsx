'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { submitOwnerLead } from '@/lib/api'
import { validateEmail, validatePhone, validateRequired } from '@/lib/validators'
import { trackEvent } from '@/lib/analytics'
import type { FormularioPropietario, TipoPropiedad, Operacion } from '@/types'

const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco', 'San Borja', 'Jesús María', 'Lince']
const TIPOS: { value: TipoPropiedad; label: string }[] = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
]
const OPERACIONES: { value: Operacion; label: string }[] = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler', label: 'Alquiler' },
]

const inputClass = 'w-full rounded-xl border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary'
const selectClass = 'w-full rounded-xl border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none transition-colors focus:border-primary'

type Estado = 'idle' | 'enviando' | 'enviado' | 'error'

export default function PublicarPage() {
  const [form, setForm] = useState<Partial<FormularioPropietario>>({})
  const [consentimiento, setConsentimiento] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof FormularioPropietario, string>> & { consentimiento?: string }>({})
  const [estado, setEstado] = useState<Estado>('idle')

  function set<K extends keyof FormularioPropietario>(key: K, value: FormularioPropietario[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errores[key]) setErrores((prev) => ({ ...prev, [key]: '' }))
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!validateRequired(form.nombre)) e.nombre = 'Tu nombre es requerido.'
    if (!validateEmail(form.email ?? '')) e.email = 'Ingresa un correo válido.'
    if (!validatePhone(form.telefono ?? '')) e.telefono = 'Ingresa un teléfono válido (+51 9XXXXXXXX).'
    if (!form.tipoInmueble) e.tipoInmueble = 'Selecciona el tipo de inmueble.'
    if (!form.operacion) e.operacion = 'Selecciona la operación.'
    if (!form.distrito) e.distrito = 'Selecciona el distrito.'
    if (!consentimiento) e.consentimiento = 'Debes aceptar la política de privacidad.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    const tipoLabel = TIPOS.find((t) => t.value === form.tipoInmueble)?.label ?? form.tipoInmueble
    const operacionLabel = OPERACIONES.find((o) => o.value === form.operacion)?.label ?? form.operacion
    const precioTexto = form.precioAproximado ? `USD $${form.precioAproximado}` : 'no especificado'
    const mensajeFinal = form.mensaje?.trim()
      ? form.mensaje
      : `Propietario interesado en publicar: ${tipoLabel} en ${form.distrito}, operación ${operacionLabel}, precio aproximado ${precioTexto}.`

    const payload: FormularioPropietario = {
      nombre: form.nombre!,
      email: form.email!,
      telefono: form.telefono!,
      tipoInmueble: form.tipoInmueble!,
      operacion: form.operacion!,
      distrito: form.distrito!,
      precioAproximado: form.precioAproximado,
      mensaje: mensajeFinal,
    }

    setEstado('enviando')
    const res = await submitOwnerLead(payload)
    setEstado(res.ok ? 'enviado' : 'error')
    if (res.ok) trackEvent('owner_lead_submitted')
  }

  if (estado === 'enviado') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary mx-auto font-syne text-2xl font-bold text-on-primary">Z</span>
          <h1 className="mt-6 font-syne text-3xl font-bold text-on-surface">¡Recibimos tu solicitud!</h1>
          <p className="mt-3 font-hanken text-base text-on-surface-variant">Un asesor ZENPLUS se pondrá en contacto contigo en las próximas 24 horas para evaluar tu propiedad.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">Propietarios</p>
        <h1 className="mt-2 font-syne text-4xl font-bold text-on-surface">Publica tu propiedad</h1>
        <p className="mt-3 font-hanken text-base text-on-surface-variant">Accede a nuestra red de compradores e inversionistas calificados. Completa el formulario y un asesor te contactará.</p>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Nombre completo</label>
            <input id="nombre" aria-required="true" className={inputClass} placeholder="Juan Pérez" value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} />
            {errores.nombre && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.nombre}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Correo electrónico</label>
            <input id="email" aria-required="true" className={inputClass} type="email" placeholder="tu@correo.com" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            {errores.email && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.email}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Teléfono</label>
            <input id="telefono" aria-required="true" className={inputClass} placeholder="+51 999 999 999" value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} />
            {errores.telefono && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.telefono}</p>}
          </div>

          <div>
            <label htmlFor="tipoInmueble" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Tipo de inmueble</label>
            <select id="tipoInmueble" aria-required="true" className={selectClass} value={form.tipoInmueble ?? ''} onChange={(e) => set('tipoInmueble', e.target.value as TipoPropiedad)}>
              <option value="">Seleccionar...</option>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errores.tipoInmueble && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.tipoInmueble}</p>}
          </div>

          <div>
            <label htmlFor="operacion" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Operación</label>
            <select id="operacion" aria-required="true" className={selectClass} value={form.operacion ?? ''} onChange={(e) => set('operacion', e.target.value as Operacion)}>
              <option value="">Seleccionar...</option>
              {OPERACIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errores.operacion && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.operacion}</p>}
          </div>

          <div>
            <label htmlFor="distrito" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Distrito</label>
            <select id="distrito" aria-required="true" className={selectClass} value={form.distrito ?? ''} onChange={(e) => set('distrito', e.target.value)}>
              <option value="">Seleccionar...</option>
              {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errores.distrito && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.distrito}</p>}
          </div>

          <div>
            <label htmlFor="precioAproximado" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Precio aproximado (USD)</label>
            <input id="precioAproximado" className={inputClass} type="number" placeholder="200000" value={form.precioAproximado ?? ''} onChange={(e) => set('precioAproximado', Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="mensaje" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">Mensaje adicional (opcional)</label>
            <textarea id="mensaje" className={inputClass} rows={4} placeholder="Cuéntanos más sobre tu propiedad..." value={form.mensaje ?? ''} onChange={(e) => set('mensaje', e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="consentimiento" className="flex items-start gap-2 font-hanken text-sm text-on-surface-variant">
              <input
                id="consentimiento"
                type="checkbox"
                aria-required="true"
                checked={consentimiento}
                onChange={(e) => {
                  setConsentimiento(e.target.checked)
                  if (errores.consentimiento) setErrores((prev) => ({ ...prev, consentimiento: '' }))
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant accent-[color:var(--color-primary)]"
              />
              <span>
                He leído y acepto la{' '}
                <Link href="/privacidad" className="text-primary">
                  política de privacidad
                </Link>{' '}
                de ZENPLUS
              </span>
            </label>
            {errores.consentimiento && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.consentimiento}</p>}
          </div>

          {estado === 'error' && (
            <p aria-live="polite" className="sm:col-span-2 rounded-xl border border-error bg-surface-mid px-4 py-3 font-hanken text-sm text-error">
              Ocurrió un error al enviar. Por favor intenta nuevamente.
            </p>
          )}

          <div className="sm:col-span-2">
            <motion.button
              type="submit"
              disabled={estado === 'enviando'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-primary py-4 font-hanken text-[15px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {estado === 'enviando' ? 'Enviando...' : 'Publicar mi propiedad'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}