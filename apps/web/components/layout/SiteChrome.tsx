'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

const RUTAS_SIN_CHROME = ['/login', '/registro']

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ocultarChrome = RUTAS_SIN_CHROME.some((ruta) => pathname?.startsWith(ruta))

  if (ocultarChrome) return <>{children}</>

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
