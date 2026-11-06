import { describe, it, expect, beforeEach } from 'vitest'
import {
  getOpportunities,
  getOpportunityById,
  updateRequirement,
  createReserva,
  createOfertaVersion,
  getOfertaThread,
} from '@/lib/api-commercial'
import { resetMockData, mockSimulationFlags } from '@/lib/mock-commercial'

describe('Commercial Engine API & Error Handling (lib/api-commercial.ts)', () => {
  beforeEach(() => {
    resetMockData()
  })

  it('retrieves opportunities with synthetic data (no PII)', async () => {
    const opps = await getOpportunities()
    expect(opps.length).toBeGreaterThan(0)
    expect(opps[0].clienteNombre).toBe('Cliente Demo 01')
    expect(opps[0].clienteEmail).toContain('example.test')
  })

  it('validates requirement numbers and returns fieldErrors on negative values', async () => {
    const res = await updateRequirement('opp-1', {
      presupuestoMin: -500,
    })
    expect(res.ok).toBe(false)
    expect(res.fieldErrors?.presupuestoMin).toBeDefined()
  })

  it('validates that presupuestoMax cannot be lower than presupuestoMin', async () => {
    const res = await updateRequirement('opp-1', {
      presupuestoMin: 2000000,
      presupuestoMax: 1000000,
    })
    expect(res.ok).toBe(false)
    expect(res.fieldErrors?.presupuestoMax).toBeDefined()
  })

  it('simulates 409 conflict when property is already reserved', async () => {
    // Atelier Miraflores Bay View is already reserved in syntheticReservas
    const res = await createReserva({
      opportunityId: 'opp-2',
      propiedadSlug: 'atelier-miraflores-bay-view',
      propiedadTitulo: 'Atelier Miraflores Bay View',
      monto: 1900000,
      moneda: 'USD',
      estado: 'Activa',
      expiraEn: new Date().toISOString(),
      creadoEn: new Date().toISOString(),
    })
    expect(res.ok).toBe(false)
    expect(res.conflicto).toBe(true)
    expect(res.status).toBe(409)
  })

  it('simulates 409 conflict when mockSimulationFlags.simulateConflict409 is set', async () => {
    mockSimulationFlags.simulateConflict409 = true
    const res = await createReserva({
      opportunityId: 'opp-1',
      propiedadSlug: 'otra-propiedad',
      propiedadTitulo: 'Otra Propiedad',
      monto: 500000,
      moneda: 'USD',
      estado: 'Activa',
      expiraEn: new Date().toISOString(),
      creadoEn: new Date().toISOString(),
    })
    expect(res.ok).toBe(false)
    expect(res.conflicto).toBe(true)
  })

  it('creates an immutable offer version without overwriting previous versions', async () => {
    const threadAntes = await getOfertaThread('opp-2')
    const countAntes = threadAntes?.versiones.length ?? 0

    const res = await createOfertaVersion('opp-2', {
      monto: 4700000,
      moneda: 'USD',
      condiciones: 'Pago al contado en 30 días.',
      creadoEn: new Date().toISOString(),
    })

    expect(res.ok).toBe(true)
    const threadDespues = await getOfertaThread('opp-2')
    expect(threadDespues?.versiones.length).toBe(countAntes + 1)
    const ultimaVersion = threadDespues?.versiones[threadDespues.versiones.length - 1]
    expect(ultimaVersion?.version).toBe(countAntes + 1)
    expect(ultimaVersion?.creadoPor).toBeDefined()
  })
})
