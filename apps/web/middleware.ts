import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['es', 'en', 'pt', 'fr', 'de'],
  defaultLocale: 'es',
})

// Unificación de rutas protegidas en un único punto (Cierra D-014)
const RUTAS_PROTEGIDAS = ['/perfil', '/admin', '/commercial', '/dashboard', '/portal']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Limpiar el idioma de la ruta para verificar protección
  const localeMatch = pathname.match(/^\/(es|en|pt|fr|de)(\/.*)?$/)
  const pathnameSinLocale = localeMatch ? localeMatch[2] || '/' : pathname
  const locale = localeMatch ? localeMatch[1] : 'es'

  const protegida = RUTAS_PROTEGIDAS.some((r) => pathnameSinLocale.startsWith(r))

  if (protegida) {
    const sesion = request.cookies.get('zenplus_session')?.value
    if (!sesion) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      url.searchParams.set('next', pathnameSinLocale)
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}