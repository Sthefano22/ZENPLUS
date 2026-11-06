'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { submitOwnerLead } from '@/lib/api'
import { validateEmail, validatePhone, validateRequired } from '@/lib/validators'
import { trackEvent } from '@/lib/analytics'
import type { FormularioPropietario, TipoPropiedad, Operacion } from '@/types'

const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco', 'San Borja', 'Jesús María', 'Lince']

const inputClass = 'w-full rounded-xl border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary'
const selectClass = 'w-full rounded-xl border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none transition-colors focus:border-primary'

type Estado = 'idle' | 'enviando' | 'enviado' | 'error'

export default function PublicarPage() {
  const t = useTranslations('publicar')
  const [form, setForm] = useState<Partial<FormularioPropietario>>({})
  const [consentimiento, setConsentimiento] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof FormularioPropietario, string>> & { consentimiento?: string }>({})
  const [estado, setEstado] = useState<Estado>('idle')

  const TIPOS: { value: TipoPropiedad; label: string }[] = [
    { value: 'departamento', label: t('tipoDepartamento') },
    { value: 'penthouse', label: t('tipoPenthouse') },
    { value: 'casa', label: t('tipoCasa') },
    { value: 'oficina', label: t('tipoOficina') },
  ]
  const OPERACIONES: { value: Operacion; label: string }[] = [
    { value: 'venta', label: t('opVenta') },
    { value: 'alquiler', label: t('opAlquiler') },
  ]

  function set<K extends keyof FormularioPropietario>(key: K, value: FormularioPropietario[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errores[key]) setErrores((prev) => ({ ...prev, [key]: '' }))
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!validateRequired(form.nombre)) e.nombre = t('errorNombre')
    if (!validateEmail(form.email ?? '')) e.email = t('errorEmail')
    if (!validatePhone(form.telefono ?? '')) e.telefono = t('errorTelefono')
    if (!form.tipoInmueble) e.tipoInmueble = t('errorTipo')
    if (!form.operacion) e.operacion = t('errorOperacion')
    if (!form.distrito) e.distrito = t('errorDistrito')
    if (!consentimiento) e.consentimiento = t('errorConsentimiento')
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    const tipoLabel = TIPOS.find((x) => x.value === form.tipoInmueble)?.label ?? form.tipoInmueble
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
          <Image src="/logo-zenplus.png" alt="ZENPLUS" width={477} height={516} className="mx-auto h-20 w-auto" />
          <h1 className="mt-6 font-syne text-3xl font-bold text-on-surface">{t('exitoTitulo')}</h1>
          <p className="mt-3 font-hanken text-base text-on-surface-variant">{t('exitoTexto')}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">{t('etiqueta')}</p>
        <h1 className="mt-2 font-syne text-4xl font-bold text-on-surface">{t('titulo')}</h1>
        <p className="mt-3 font-hanken text-base text-on-surface-variant">{t('subtitulo')}</p>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('nombre')}</label>
            <input id="nombre" aria-required="true" className={inputClass} placeholder={t('nombrePlaceholder')} value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} />
            {errores.nombre && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.nombre}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('email')}</label>
            <input id="email" aria-required="true" className={inputClass} type="email" placeholder={t('emailPlaceholder')} value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            {errores.email && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.email}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('telefono')}</label>
            <input id="telefono" aria-required="true" className={inputClass} placeholder={t('telefonoPlaceholder')} value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} />
            {errores.telefono && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.telefono}</p>}
          </div>

          <div>
            <label htmlFor="tipoInmueble" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('tipoInmueble')}</label>
            <select id="tipoInmueble" aria-required="true" className={selectClass} value={form.tipoInmueble ?? ''} onChange={(e) => set('tipoInmueble', e.target.value as TipoPropiedad)}>
              <option value="">{t('seleccionar')}</option>
              {TIPOS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            {errores.tipoInmueble && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.tipoInmueble}</p>}
          </div>

          <div>
            <label htmlFor="operacion" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('operacion')}</label>
            <select id="operacion" aria-required="true" className={selectClass} value={form.operacion ?? ''} onChange={(e) => set('operacion', e.target.value as Operacion)}>
              <option value="">{t('seleccionar')}</option>
              {OPERACIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errores.operacion && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.operacion}</p>}
          </div>

          <div>
            <label htmlFor="distrito" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('distrito')}</label>
            <select id="distrito" aria-required="true" className={selectClass} value={form.distrito ?? ''} onChange={(e) => set('distrito', e.target.value)}>
              <option value="">{t('seleccionar')}</option>
              {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errores.distrito && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.distrito}</p>}
          </div>

          <div>
            <label htmlFor="precioAproximado" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('precioAproximado')}</label>
            <input id="precioAproximado" className={inputClass} type="number" placeholder={t('precioPlaceholder')} value={form.precioAproximado ?? ''} onChange={(e) => set('precioAproximado', Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="mensaje" className="mb-1.5 block font-hanken text-sm font-medium text-on-surface">{t('mensaje')}</label>
            <textarea id="mensaje" className={inputClass} rows={4} placeholder={t('mensajePlaceholder')} value={form.mensaje ?? ''} onChange={(e) => set('mensaje', e.target.value)} />
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
                {t('consentimiento')}{' '}
                <Link href="/privacidad" className="text-primary">
                  {t('privacidad')}
                </Link>{' '}
                {t('consentimientoPost')}
              </span>
            </label>
            {errores.consentimiento && <p aria-live="polite" className="mt-1 font-hanken text-xs text-error">{errores.consentimiento}</p>}
          </div>

          {estado === 'error' && (
            <p aria-live="polite" className="sm:col-span-2 rounded-xl border border-error bg-surface-mid px-4 py-3 font-hanken text-sm text-error">
              {t('errorEnvio')}
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
              {estado === 'enviando' ? t('enviando') : t('enviar')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}