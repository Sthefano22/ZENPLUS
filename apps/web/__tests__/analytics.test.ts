import { describe, it, expect } from 'vitest'
import { sanitizeAnalyticsParams } from '@/lib/analytics'

describe('Analytics PII Sanitization (lib/analytics.ts)', () => {
  it('allows safe technical parameters', () => {
    const params = {
      opportunityId: 'opp-1',
      propiedadSlug: 'sky-penthouse-reserve',
      accion: 'contraoferta',
      version: 2,
    }
    const sanitized = sanitizeAnalyticsParams(params)
    expect(sanitized).toEqual(params)
  })

  it('strips forbidden PII keys like nombre, email, telefono, dni', () => {
    const params = {
      opportunityId: 'opp-1',
      clienteNombre: 'Rodrigo Alvarado',
      clienteEmail: 'cliente@example.com',
      telefono: '+51 999 888 777',
      dni: '12345678',
      propiedadSlug: 'sky-penthouse',
    }
    const sanitized = sanitizeAnalyticsParams(params)
    expect(sanitized?.clienteNombre).toBeUndefined()
    expect(sanitized?.clienteEmail).toBeUndefined()
    expect(sanitized?.telefono).toBeUndefined()
    expect(sanitized?.dni).toBeUndefined()
    expect(sanitized?.propiedadSlug).toBe('sky-penthouse')
    expect(sanitized?.opportunityId).toBe('opp-1')
  })

  it('strips values that look like email addresses or phone numbers even if key is generic', () => {
    const params = {
      opportunityId: 'opp-1',
      customData: 'persona@dominio.com',
      contactInfo: '+51 987654321',
      status: 'success',
    }
    const sanitized = sanitizeAnalyticsParams(params)
    expect(sanitized?.customData).toBeUndefined()
    expect(sanitized?.contactInfo).toBeUndefined()
    expect(sanitized?.status).toBe('success')
  })
})
