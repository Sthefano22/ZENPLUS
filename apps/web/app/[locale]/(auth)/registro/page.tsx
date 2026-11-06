'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'motion/react'
import { validarRegistro } from '@/lib/validators'

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-low py-3.5 pl-11 pr-4 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-outline'

function CampoError({ mensaje }: { mensaje?: string }) {
  return (
    <AnimatePresence>
      {mensaje && (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden font-hanken text-xs text-error"
        >
          {mensaje}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function IconoOjo({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.24A9.8 9.8 0 0112 4c7 0 10 8 10 8a17.6 17.6 0 01-3.16 4.14M6.5 6.5A17.9 17.9 0 002 12s3 8 10 8a9.7 9.7 0 004.15-.9" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function RegistroPage() {
  const t = useTranslations('registro')
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(false)

  function calcularFortaleza(pwd: string): { nivel: number; etiqueta: string } {
    if (!pwd) return { nivel: 0, etiqueta: '' }
    let puntos = 0
    if (pwd.length >= 8) puntos++
    if (pwd.length >= 12) puntos++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) puntos++
    if (/\d/.test(pwd)) puntos++
    if (/[^A-Za-z0-9]/.test(pwd)) puntos++
    const nivel = Math.min(4, Math.max(1, puntos - (pwd.length < 8 ? 1 : 0)))
    const etiquetas = ['', t('fortalezaDebil'), t('fortalezaAceptable'), t('fortalezaBuena'), t('fortalezaExcelente')]
    return { nivel, etiqueta: etiquetas[nivel] }
  }

  const fortaleza = calcularFortaleza(password)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validacion = validarRegistro({
      nombre,
      email,
      telefono,
      password,
      confirmarPassword,
      aceptaTerminos,
    })
    setErrores(validacion.errores)
    if (!validacion.valido) return

    setCargando(true)

    // TODO: reemplazar con IAM real — sesión mock activa solo para demo
    document.cookie = 'zenplus_session=mock; path=/'
    setTimeout(() => router.push('/'), 400)
  }

  return (
    <div className="flex min-h-screen w-full">
      
      <div className="relative hidden w-[40%] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
          alt="Interior de lujo ZENPLUS"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />

        <div className="absolute bottom-14 left-10 right-10">
          <Image src="/logo-zenplus.png" alt="ZENPLUS" width={477} height={516} className="h-16 w-auto" />
          <h2 className="mt-6 font-syne text-3xl font-bold leading-tight text-white">
            {t('esloganTitulo')}
            <br />
            {t('esloganTitulo2')}
          </h2>
          <p className="mt-4 max-w-sm font-hanken text-sm text-on-surface-variant">
            {t('esloganTexto')}
          </p>
        </div>
      </div>

      
      <div className="relative flex w-full items-center justify-center bg-surface-container-lowest px-6 lg:w-[60%]">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm py-16"
        >
          <p className="font-hanken text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t('etiqueta')}
          </p>
          <h1 className="mt-3 font-syne text-3xl font-bold text-on-surface">{t('titulo')}</h1>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="font-hanken text-[13px] text-on-surface-variant">
                {t('nombre')}
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={iconClass}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0116 0" />
                </svg>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={t('nombrePlaceholder')}
                  aria-invalid={!!errores.nombre}
                  className={inputClass}
                />
              </div>
              <CampoError mensaje={errores.nombre} />
            </div>

            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-hanken text-[13px] text-on-surface-variant">
                {t('email')}
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
                  <path d="M22 6l-10 7L2 6" />
                  <path d="M2 6h20v12H2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  aria-invalid={!!errores.email}
                  className={inputClass}
                />
              </div>
              <CampoError mensaje={errores.email} />
            </div>

            
            <div className="flex flex-col gap-2">
              <label htmlFor="telefono" className="font-hanken text-[13px] text-on-surface-variant">
                {t('telefono')} <span className="text-outline">{t('telefonoOpcional')}</span>
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
                  <rect x="6" y="2" width="12" height="20" rx="2" />
                  <path d="M11 18h2" />
                </svg>
                <input
                  id="telefono"
                  type="tel"
                  autoComplete="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder={t('telefonoPlaceholder')}
                  aria-invalid={!!errores.telefono}
                  className={inputClass}
                />
              </div>
              <CampoError mensaje={errores.telefono} />
            </div>

            
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-hanken text-[13px] text-on-surface-variant">
                {t('password')}
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  id="password"
                  type={verPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  aria-invalid={!!errores.password}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
                  aria-label={verPassword ? t('ocultarContrasena') : t('mostrarContrasena')}
                >
                  <IconoOjo visible={verPassword} />
                </button>
              </div>

              {password && (
                <div className="flex items-center gap-3" aria-live="polite">
                  <div className="flex flex-1 gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          n <= fortaleza.nivel
                            ? fortaleza.nivel <= 1
                              ? 'bg-error'
                              : 'bg-primary'
                            : 'bg-outline-variant'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-hanken text-[11px] text-on-surface-variant">
                    {fortaleza.etiqueta}
                  </span>
                </div>
              )}
              <CampoError mensaje={errores.password} />
            </div>

            
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmarPassword" className="font-hanken text-[13px] text-on-surface-variant">
                {t('confirmarPassword')}
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
                  <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <input
                  id="confirmarPassword"
                  type={verConfirmar ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder={t('confirmarPlaceholder')}
                  aria-invalid={!!errores.confirmarPassword}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setVerConfirmar((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
                  aria-label={verConfirmar ? t('ocultarContrasena') : t('mostrarContrasena')}
                >
                  <IconoOjo visible={verConfirmar} />
                </button>
              </div>
              <CampoError mensaje={errores.confirmarPassword} />
            </div>

            
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2 font-hanken text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant accent-[color:var(--color-primary)]"
                />
                <span>
                  {t('terminos')}{' '}
                  <Link href="/terminos" className="text-primary">
                    {t('terminosLink')}
                  </Link>{' '}
                  {t('yLa')}{' '}
                  <Link href="/privacidad" className="text-primary">
                    {t('privacidadLink')}
                  </Link>
                  .
                </span>
              </label>
              <CampoError mensaje={errores.terminos} />
            </div>

            <motion.button
              type="submit"
              disabled={cargando}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 w-full rounded-full bg-primary py-4 font-hanken text-[15px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? t('creando') : t('crear')}
            </motion.button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-outline-variant" />
            <span className="font-hanken text-[11px] uppercase tracking-widest text-outline">{t('oRegistrate')}</span>
            <span className="h-px flex-1 bg-outline-variant" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant py-3.5 font-hanken text-sm font-medium text-on-surface transition-colors hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 01-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0012 24z" />
              <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 010-4.54v-3.1H1.28a12 12 0 000 10.74z" />
              <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 001.28 6.63l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            {t('google')}
          </button>

          <p className="mt-8 text-center font-hanken text-sm text-on-surface-variant">
            {t('yaTienes')}{' '}
            <Link href="/login" className="font-semibold text-primary">
              {t('iniciaSesion')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}