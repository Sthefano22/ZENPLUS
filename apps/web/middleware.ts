import { NextRequest, NextResponse } from 'next/server'

const RUTAS_PROTEGIDAS = ['/publicar', '/perfil']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const requiereSesion = RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta))
  if (!requiereSesion) return NextResponse.next()

  const session = req.cookies.get('zenplus_session')
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/publicar/:path*', '/perfil/:path*'],
}
