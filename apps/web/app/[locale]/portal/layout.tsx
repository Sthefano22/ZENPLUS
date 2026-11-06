import { Link } from '@/i18n/navigation'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="font-syne text-base font-bold text-on-surface">
            ZENPLUS <span className="text-on-surface-variant">·</span> Portal
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/portal/cliente"
              className="font-hanken text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Comprador
            </Link>
            <Link
              href="/portal/propietario"
              className="font-hanken text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Propietario
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
