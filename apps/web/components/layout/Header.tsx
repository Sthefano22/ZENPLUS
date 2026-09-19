'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

const NAV_DROPDOWNS = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Comprar', href: '/buscar?operacion=venta' },
  { label: 'Alquilar', href: '/buscar?operacion=alquiler' },
]

function NavDropdown({ label }: { label: string }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 font-hanken text-sm text-on-surface-variant transition-colors hover:text-primary"
      >
        {label}
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full pt-3"
          >
            <div className="w-56 rounded-lg border border-outline-variant bg-surface-mid p-2 shadow-xl">
              <p className="px-3 py-2 font-hanken text-xs text-on-surface-variant">
                Próximamente más opciones
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-syne text-lg font-bold text-on-primary">
            Z
          </span>
          <span>
            <span className="block font-syne text-lg font-bold leading-none text-primary">
              ZENPLUS
            </span>
            <span className="mt-0.5 block font-hanken text-[10px] tracking-widest text-on-surface-variant">
              DESARROLLO INMOBILIARIO
            </span>
          </span>
        </Link>

        
        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_DROPDOWNS.map((item) => (
            <NavDropdown key={item.label} label={item.label} />
          ))}
          <Link
            href="/publicar"
            className={`font-hanken text-sm transition-colors hover:text-primary ${
              pathname === '/publicar' ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            Publicar
          </Link>
        </nav>

        
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </button>

          <button
            type="button"
            aria-label="Mensajes"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          <Link
            href="/login"
            className="rounded-full bg-primary px-6 py-2.5 font-hanken text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Iniciar sesión
          </Link>
        </div>

        
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface lg:hidden"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMenuAbierto(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-surface-low p-6 lg:hidden"
            >
              <button
                type="button"
                className="mb-8 flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
              <nav className="flex flex-col gap-5">
                <Link href="/servicios" onClick={() => setMenuAbierto(false)} className="font-hanken text-base text-on-surface">Servicios</Link>
                <Link href="/buscar?operacion=venta" onClick={() => setMenuAbierto(false)} className="font-hanken text-base text-on-surface">Comprar</Link>
                <Link href="/buscar?operacion=alquiler" onClick={() => setMenuAbierto(false)} className="font-hanken text-base text-on-surface">Alquilar</Link>
                <Link href="/publicar" onClick={() => setMenuAbierto(false)} className="font-hanken text-base text-on-surface">Publicar</Link>
                <Link href="/login" onClick={() => setMenuAbierto(false)} className="mt-4 rounded-full bg-primary px-6 py-3 text-center font-hanken text-sm font-semibold text-on-primary">
                  Iniciar sesión
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
