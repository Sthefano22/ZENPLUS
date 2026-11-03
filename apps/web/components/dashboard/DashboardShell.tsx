'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'

const SECCIONES = [
  { href: '/dashboard', label: 'Resumen ejecutivo' },
  { href: '/dashboard/funnel', label: 'Funnel comercial' },
  { href: '/dashboard/inventario', label: 'Inventario' },
  { href: '/dashboard/asesores', label: 'Asesores' },
  { href: '/dashboard/transacciones', label: 'Transacciones' },
  { href: '/dashboard/fuentes', label: 'Fuentes' },
  { href: '/dashboard/xenia', label: 'XENIA Insights' },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // El evento dashboard_viewed lo emite cada page.tsx al montar (evita duplicarlo aquí)
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  const nav = (
    <nav aria-label="Secciones del dashboard">
      <ul className="flex flex-col gap-1">
        {SECCIONES.map((s) => {
          const activa = s.href === '/dashboard' ? pathname === s.href : pathname.startsWith(s.href)
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={activa ? 'page' : undefined}
                className={`block rounded-xl px-4 py-2.5 font-hanken text-sm transition-colors ${
                  activa
                    ? 'bg-surface-high font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                {s.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              aria-expanded={menuAbierto}
              aria-controls="dashboard-nav-movil"
              aria-label={menuAbierto ? 'Cerrar menú del dashboard' : 'Abrir menú del dashboard'}
              className="rounded-full p-2 text-on-surface hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            >
              {menuAbierto ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="font-syne text-base font-bold text-on-surface">
              ZENPLUS <span className="text-on-surface-variant">·</span> Intelligence
            </Link>
          </div>
          <div className="flex items-center gap-4 font-hanken text-sm">
            <Link href="/commercial" className="text-on-surface-variant transition-colors hover:text-primary">
              Workspace
            </Link>
            <Link href="/" className="text-on-surface-variant transition-colors hover:text-primary">
              Volver al sitio
            </Link>
          </div>
        </div>
        {menuAbierto && (
          <div id="dashboard-nav-movil" className="border-t border-outline-variant/60 px-4 py-3 lg:hidden">
            {nav}
          </div>
        )}
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 lg:px-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
