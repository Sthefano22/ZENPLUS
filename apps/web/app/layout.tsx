import type { Metadata } from 'next'
import './globals.css'
import SiteChrome from '@/components/layout/SiteChrome'

export const metadata: Metadata = {
  title: 'ZENPLUS.pe | Bienes Raíces de Lujo en Perú',
  description:
    'Departamentos, casas y oficinas exclusivas en San Isidro, Miraflores, La Molina y Barranco. La plataforma inmobiliaria de lujo líder en el Perú.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-surface font-hanken text-on-surface antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
