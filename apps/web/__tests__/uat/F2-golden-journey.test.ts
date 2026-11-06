import { describe, it, expect, beforeEach } from 'vitest'
import {
  getOpportunities,
  getOpportunityById,
  updateRequirement,
  getRequirement,
  createVisita,
  getVisitas,
  updateVisita,
  createOfertaVersion,
  getOfertaThread,
  createReserva,
  getReserva,
  getTimeline,
} from '@/lib/api-commercial'
import { getEligibleCandidateProperties } from '@/lib/api-inventory-eligible'
import { resetMockData } from '@/lib/mock-commercial'

describe('UAT Golden E2E Journey - Fase 2 (Commercial Engine)', () => {
  beforeEach(() => {
    resetMockData()
  })

  it('executes full Golden Journey F2 end-to-end', async () => {
    // 1. Asesor ingresa y recupera Opportunity calificada
    const opps = await getOpportunities()
    expect(opps.length).toBeGreaterThan(0)
    const oppId = 'opp-1'
    const opp = await getOpportunityById(oppId)
    expect(opp).not.toBeNull()
    expect(opp?.codigo).toBe('OPP-2026-001')

    // 2. Asesor edita y afina el Requirement del cliente
    const updateReqRes = await updateRequirement(oppId, {
      operacion: 'venta',
      tipos: ['penthouse'],
      distritos: ['San Isidro'],
      presupuestoMin: 1100000,
      presupuestoMax: 2000000,
      areaMinM2: 250,
      dormitoriosMin: 3,
    })
    expect(updateReqRes.ok).toBe(true)

    const reqActualizado = await getRequirement(oppId)
    expect(reqActualizado?.areaMinM2).toBe(250)

    // 3. Sistema consulta inventario de Alpha y obtiene inmuebles elegibles
    const candidatesRes = await getEligibleCandidateProperties({
      operacion: reqActualizado?.operacion,
      tipos: reqActualizado?.tipos,
      distritos: reqActualizado?.distritos,
      presupuestoMin: reqActualizado?.presupuestoMin,
      presupuestoMax: reqActualizado?.presupuestoMax,
      areaMinM2: reqActualizado?.areaMinM2,
      dormitoriosMin: reqActualizado?.dormitoriosMin,
    })
    expect(candidatesRes.ok).toBe(true)
    if (!candidatesRes.ok) return
    const candidatas = candidatesRes.data
    expect(candidatas.length).toBeGreaterThan(0)
    const seleccionada = candidatas[0]
    expect(seleccionada.slug).toBe('sky-penthouse-reserve')

    // 4. Se agenda visita técnica para el inmueble seleccionado con America/Lima
    const createVisitaRes = await createVisita({
      opportunityId: oppId,
      propiedadSlug: seleccionada.slug,
      propiedadTitulo: seleccionada.titulo,
      fecha: '2026-10-15',
      hora: '15:00',
      asesorNombre: opp!.asesorNombre,
      estado: 'Programada',
    })
    expect(createVisitaRes.ok).toBe(true)
    const nuevaVisitaId = createVisitaRes.id!

    // 5. Visita se confirma y luego se marca como Realizada con feedback y siguiente acción
    await updateVisita(nuevaVisitaId, { estado: 'Confirmada' })
    await updateVisita(nuevaVisitaId, {
      estado: 'Realizada',
      feedback: 'Cliente maravillado con la terraza y vista al golf.',
      interes: 'Alto',
      siguienteAccion: 'Presentar oferta formal de compra.',
    })

    const visitasActuales = await getVisitas(oppId)
    const visitaRealizada = visitasActuales.find((v) => v.id === nuevaVisitaId)
    expect(visitaRealizada?.estado).toBe('Realizada')
    expect(visitaRealizada?.interes).toBe('Alto')

    // 6. Oferta: se registra versión y contraoferta inmutable
    const ofertaRes1 = await createOfertaVersion(oppId, {
      monto: 1200000,
      moneda: 'USD',
      condiciones: '30% inicial y saldo a 60 días.',
      creadoEn: new Date().toISOString(),
    })
    expect(ofertaRes1.ok).toBe(true)

    const ofertaRes2 = await createOfertaVersion(oppId, {
      monto: 1250000,
      moneda: 'USD',
      condiciones: 'Propietario acepta con 35% inicial.',
      creadoEn: new Date().toISOString(),
    })
    expect(ofertaRes2.ok).toBe(true)

    const threadOfertas = await getOfertaThread(oppId)
    expect(threadOfertas?.versiones.length).toBeGreaterThanOrEqual(2)

    // 7. Reserva: Se emite reserva de confirmación
    const reservaRes = await createReserva({
      opportunityId: oppId,
      propiedadSlug: seleccionada.slug,
      propiedadTitulo: seleccionada.titulo,
      monto: 62500, // 5% de separación
      moneda: 'USD',
      estado: 'Activa',
      expiraEn: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      creadoEn: new Date().toISOString(),
    })
    expect(reservaRes.ok).toBe(true)
    expect(reservaRes.id).toBeDefined()

    const reservaCreada = await getReserva(oppId)
    expect(reservaCreada?.estado).toBe('Activa')
    expect(reservaCreada?.propiedadSlug).toBe('sky-penthouse-reserve')

    // 8. Trazabilidad: Timeline contiene eventos registrados
    const timeline = await getTimeline(oppId)
    expect(timeline.length).toBeGreaterThan(0)
  })
})
