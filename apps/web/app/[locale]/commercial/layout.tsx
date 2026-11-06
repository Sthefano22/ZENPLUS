import { Link } from '@/i18n/navigation'

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  // La protección de autenticación está unificada en middleware.ts (Cierra D-014)

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/commercial" className="font-syne text-base font-bold text-on-surface">
            ZENPLUS <span className="text-on-surface-variant">·</span> Workspace
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/direccion"
              className="font-hanken text-xs text-on-surface-variant transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="font-hanken text-xs text-on-surface-variant transition-colors hover:text-primary"
            >
              Volver al sitio
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
