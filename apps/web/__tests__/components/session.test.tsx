// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { getSession, can, MOCK_USERS_BY_ROLE } from '@/lib/session'

describe('Session and Role Permissions (lib/session.ts)', () => {
  it('returns null when no cookie header is provided', () => {
    expect(getSession(null)).toBeNull()
    expect(getSession('')).toBeNull()
  })

  it('parses valid session cookie and defaults to asesor role', () => {
    const session = getSession('zenplus_session=demo-token')
    expect(session).not.toBeNull()
    expect(session?.user.rol).toBe('asesor')
    expect(session?.user.nombre).toBe(MOCK_USERS_BY_ROLE.asesor.nombre)
  })

  it('correctly reads zenplus_role cookie for lider or direccion', () => {
    const sessionLider = getSession('zenplus_session=demo-token; zenplus_role=lider')
    expect(sessionLider?.user.rol).toBe('lider')

    const sessionDir = getSession('zenplus_session=demo-token; zenplus_role=direccion')
    expect(sessionDir?.user.rol).toBe('direccion')
  })

  it('enforces UI permissions reflection with can()', () => {
    const asesor = { user: MOCK_USERS_BY_ROLE.asesor, expiresAt: '' }
    const cliente = { user: MOCK_USERS_BY_ROLE.cliente, expiresAt: '' }
    const direccion = { user: MOCK_USERS_BY_ROLE.direccion, expiresAt: '' }

    expect(can(asesor, 'ver_commercial')).toBe(true)
    expect(can(cliente, 'ver_commercial')).toBe(false)

    expect(can(asesor, 'ver_dashboard_direccion')).toBe(false)
    expect(can(direccion, 'ver_dashboard_direccion')).toBe(true)

    expect(can(asesor, 'exportar_datos')).toBe(false)
    expect(can(direccion, 'exportar_datos')).toBe(true)
  })
})
