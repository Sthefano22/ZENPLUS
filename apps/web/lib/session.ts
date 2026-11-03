export type Rol = 'asesor' | 'lider' | 'direccion' | 'admin' | 'cliente' | 'propietario'

export interface UserSession {
  id: string
  nombre: string
  email: string
  rol: Rol
}

export interface SessionData {
  user: UserSession
  expiresAt: string
}

/**
 * Usuarios sintéticos predeterminados para pruebas de rol
 */
export const MOCK_USERS_BY_ROLE: Record<Rol, UserSession> = {
  asesor: {
    id: 'ase-1',
    nombre: 'Asesor Demo 01',
    email: 'asesor.demo01@zenplus.test',
    rol: 'asesor',
  },
  lider: {
    id: 'lid-1',
    nombre: 'Líder Comercial Demo',
    email: 'lider.comercial@zenplus.test',
    rol: 'lider',
  },
  direccion: {
    id: 'dir-1',
    nombre: 'Dirección General Demo',
    email: 'direccion@zenplus.test',
    rol: 'direccion',
  },
  admin: {
    id: 'adm-1',
    nombre: 'Administrador Demo',
    email: 'admin@zenplus.test',
    rol: 'admin',
  },
  cliente: {
    id: 'cli-1',
    nombre: 'Cliente Demo 01',
    email: 'cliente.demo01@example.test',
    rol: 'cliente',
  },
  propietario: {
    id: 'prop-1',
    nombre: 'Propietario Demo 01',
    email: 'propietario.demo01@example.test',
    rol: 'propietario',
  },
}

/**
 * Obtiene la sesión actual en Server Components / Route Handlers.
 * En modo mock, lee la cookie 'zenplus_session' y 'zenplus_role' (opcional, default 'asesor').
 * En producción con Beta IAM, se reemplazará por la validación de token JWT/Sesión de Beta.
 */
export function getSession(cookieHeader?: string | null): SessionData | null {
  if (!cookieHeader) return null

  // Parser simple de cookies
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )

  const token = cookies['zenplus_session']
  if (!token) return null

  const rol = (cookies['zenplus_role'] as Rol) || 'asesor'
  const user = MOCK_USERS_BY_ROLE[rol] || MOCK_USERS_BY_ROLE.asesor

  return {
    user,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Helper client-side para obtener la sesión mock actual
 */
export function getClientSession(): SessionData | null {
  if (typeof document === 'undefined') return null
  return getSession(document.cookie)
}

/**
 * can(session, action, resource?): Helper para REFLEJAR en UI permisos.
 * REGLA DE ORO: La UI NUNCA es el mecanismo de autorización. El backend (Beta)
 * valida la autorización real. Este helper solo mejora la experiencia de usuario.
 */
export function can(
  session: SessionData | null,
  accion:
    | 'ver_commercial'
    | 'editar_requirement'
    | 'crear_visita'
    | 'crear_oferta'
    | 'crear_reserva'
    | 'ver_operaciones'
    | 'subir_documentos'
    | 'ver_dashboard_direccion'
    | 'ver_dashboard_asesor'
    | 'exportar_datos',
  _recurso?: unknown
): boolean {
  if (!session) return false
  const { rol } = session.user

  switch (accion) {
    case 'ver_commercial':
    case 'editar_requirement':
    case 'crear_visita':
    case 'crear_oferta':
    case 'crear_reserva':
      return ['asesor', 'lider', 'direccion', 'admin'].includes(rol)

    case 'ver_operaciones':
    case 'subir_documentos':
      return ['asesor', 'lider', 'direccion', 'admin', 'cliente', 'propietario'].includes(rol)

    case 'ver_dashboard_direccion':
      return ['direccion', 'lider', 'admin'].includes(rol)

    case 'ver_dashboard_asesor':
      return ['asesor', 'lider', 'direccion', 'admin'].includes(rol)

    case 'exportar_datos':
      return ['direccion', 'admin'].includes(rol)

    default:
      return false
  }
}
