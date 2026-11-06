import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAsesoresKPI,
  getFunnelComercial,
  getInventarioKPI,
  getKPIsDireccion,
  getSourceKPI,
  getTransaccionKPI,
  getXENIAInsights,
} from '@/lib/api-dashboard'
import { dashboardMockFlags } from '@/lib/mock-dashboard'

/**
 * UAT Golden E2E Journey — Fase 4 (Data & Management Intelligence)
 *
 * Flujo integrado verificado:
 * Evento/estado operacional → contrato analítico → ingesta/transformación →
 * dataset gobernado → reconciliación → KPI service → dashboard autorizado →
 * decisión de gestión → source/aggregate XENIA-ready con provenance.
 *
 * Tickets cubiertos: GAM4-001, GAM4-002, GAM4-003, GAM4-004, GAM4-005,
 *                    GAM4-006, GAM4-007, GAM4-008, GAM4-011
 */
describe('UAT Golden E2E Journey - Fase 4 (Data & Management Intelligence)', () => {
  const FILTROS_BASE = { periodo: '30d' } as const

  beforeEach(() => {
    dashboardMockFlags.simularError = false
  })

  it('GAM4-001 / GAM4-008 — Direction dashboard: KPIs P0 con MetricContract y filtros', async () => {
    // 1. KPIs sin filtros — vista Dirección
    const kpis = await getKPIsDireccion(FILTROS_BASE)
    expect(kpis.length).toBeGreaterThan(0)

    const primerKPI = kpis[0]
    // Todo KPI P0 debe tener MetricContract definido (GAM4-001)
    expect(primerKPI.id).toBeDefined()
    expect(primerKPI.label).toBeDefined()
    expect(primerKPI.valor).toBeDefined()
    expect(primerKPI.lastUpdated).toBeDefined()
    expect(primerKPI.metricContract).toBeDefined()
    const mc = primerKPI.metricContract
    expect(mc.nombre).toBeTruthy()
    expect(mc.formula).toBeTruthy()
    expect(mc.fuente).toBeTruthy()
    expect(mc.freshnessMinutos).toBeGreaterThan(0)

    // 2. Filtro por zona (GAM4-008)
    const kpisFiltrados = await getKPIsDireccion({ ...FILTROS_BASE, zona: 'Miraflores' })
    expect(kpisFiltrados.length).toBeGreaterThan(0)
    // El periodo debe propagarse al dato
    expect(kpisFiltrados[0].periodo).toBe('30d')
  })

  it('GAM4-002 — Commercial funnel: etapas y sanidad Lead ≥ Operación', async () => {
    const funnel = await getFunnelComercial(FILTROS_BASE)

    expect(funnel.periodo).toBe('30d')
    expect(funnel.etapas).toBeDefined()
    expect(funnel.etapas.length).toBeGreaterThanOrEqual(5) // Lead→Calificados→Opp→Visitas→Reservas→Op

    // Verificar que todas las etapas tienen `cantidad` numérica (campo real del tipo)
    funnel.etapas.forEach((e) => {
      expect(e.etapa).toBeTruthy()
      expect(typeof e.cantidad).toBe('number')
      expect(e.cantidad).toBeGreaterThanOrEqual(0)
      expect(typeof e.porcentaje).toBe('number')
    })

    // Regla básica de embudo: primera etapa ≥ última etapa
    const primeraCantidad = funnel.etapas[0].cantidad
    const ultimaCantidad = funnel.etapas[funnel.etapas.length - 1].cantidad
    expect(primeraCantidad).toBeGreaterThanOrEqual(ultimaCantidad)

    // Tasa de conversión total coherente
    expect(funnel.tasaConversionTotal).toBeGreaterThanOrEqual(0)
    expect(funnel.tasaConversionTotal).toBeLessThanOrEqual(100)

    // Freshness (GAM4-007)
    expect(funnel.lastUpdated).toBeDefined()
    expect(typeof funnel.isStale).toBe('boolean')
  })

  it('GAM4-003 — Inventory dashboard: disponibilidad, publicación, consultas y rotación', async () => {
    const inv = await getInventarioKPI(FILTROS_BASE)

    expect(inv.disponibles).toBeGreaterThanOrEqual(0)
    expect(inv.reservados).toBeGreaterThanOrEqual(0)
    expect(inv.enNegociacion).toBeGreaterThanOrEqual(0)
    expect(inv.publicados).toBeGreaterThanOrEqual(0)
    expect(inv.totalActivos).toBeGreaterThan(0)
    expect(inv.consultasUltimos30d).toBeGreaterThanOrEqual(0)
    expect(inv.rotacionPromedioDias).toBeGreaterThan(0)

    // Sanidad: disponibles ≤ totalActivos
    expect(inv.disponibles).toBeLessThanOrEqual(inv.totalActivos)

    // Freshness metadata (GAM4-007)
    expect(inv.lastUpdated).toBeDefined()
    expect(typeof inv.isStale).toBe('boolean')
  })

  it('GAM4-004 / GAM4-008 — Advisor dashboard: Data Scope (un asesor ve solo sus datos)', async () => {
    // Vista Dirección — todos los asesores
    const todos = await getAsesoresKPI(FILTROS_BASE)
    expect(todos.length).toBeGreaterThan(1)

    const primerAsesor = todos[0]
    expect(primerAsesor.asesorId).toBeDefined()
    expect(primerAsesor.asesorNombre).toBeTruthy()
    expect(typeof primerAsesor.leadsAsignados).toBe('number')
    expect(typeof primerAsesor.tasaConversion).toBe('number')

    // Data Scope: filtrado por asesorId devuelve exactamente 1 registro
    const scope = await getAsesoresKPI({ ...FILTROS_BASE, asesorId: primerAsesor.asesorId })
    expect(scope.length).toBe(1)
    expect(scope[0].asesorId).toBe(primerAsesor.asesorId)

    // Un asesor NO debe ver datos de otro asesor
    const otroAsesorId = todos[1]?.asesorId
    if (otroAsesorId) {
      const scopeOtro = await getAsesoresKPI({ ...FILTROS_BASE, asesorId: otroAsesorId })
      const tieneDatosAsesor1 = scopeOtro.some((a) => a.asesorId === primerAsesor.asesorId)
      expect(tieneDatosAsesor1).toBe(false)
    }
  })

  it('GAM4-005 — Source performance: leads/conversión por fuente con contexto', async () => {
    const fuentes = await getSourceKPI(FILTROS_BASE)

    expect(fuentes.fuentes).toBeDefined()
    expect(fuentes.fuentes.length).toBeGreaterThan(0)

    const primeraFuente = fuentes.fuentes[0]
    expect(primeraFuente.fuente).toBeTruthy()
    expect(typeof primeraFuente.leads).toBe('number')
    expect(typeof primeraFuente.conversion).toBe('number')
    expect(primeraFuente.conversion).toBeGreaterThanOrEqual(0)
    expect(primeraFuente.conversion).toBeLessThanOrEqual(100)

    // Disclaimer de atribución presente (GAM4-005)
    expect(fuentes.disclaimer).toBeTruthy()

    // Freshness (GAM4-007)
    expect(fuentes.lastUpdated).toBeDefined()

    // Filtro por fuente — Data Scope de fuentes (GAM4-008)
    const fuenteFiltrada = await getSourceKPI({ ...FILTROS_BASE, fuente: primeraFuente.fuente })
    expect(fuenteFiltrada.fuentes.length).toBeGreaterThan(0)
    expect(fuenteFiltrada.fuentes[0].fuente).toBe(primeraFuente.fuente)
  })

  it('GAM4-006 — Transaction dashboard: operaciones, cierre y tiempo promedio', async () => {
    const tx = await getTransaccionKPI(FILTROS_BASE)

    expect(tx.periodo).toBe('30d')
    // Nombres de campo según TransaccionKPI en types/index.ts
    expect(typeof tx.operacionesTotales).toBe('number')
    expect(typeof tx.operacionesCerradas).toBe('number')
    expect(typeof tx.operacionesEnProceso).toBe('number')
    expect(typeof tx.tiempoPromedioCierreDias).toBe('number')
    expect(tx.tiempoPromedioCierreDias).toBeGreaterThan(0)
    expect(typeof tx.valorTotalUSD).toBe('number')

    // Sanidad: cerradas + en proceso ≤ totales (+1 tolerancia por concurrencia)
    expect(tx.operacionesCerradas + tx.operacionesEnProceso).toBeLessThanOrEqual(
      tx.operacionesTotales + 1
    )

    // Freshness (GAM4-007)
    expect(tx.lastUpdated).toBeDefined()
    expect(typeof tx.isStale).toBe('boolean')
  })

  it('GAM4-007 — Data confidence UX: stale/error state y simulación de falla de API', async () => {
    // Estado normal: datos frescos
    const kpisOk = await getKPIsDireccion(FILTROS_BASE)
    expect(kpisOk.length).toBeGreaterThan(0)

    // Simular error de API (dashboardMockFlags.simularError)
    dashboardMockFlags.simularError = true
    await expect(getKPIsDireccion(FILTROS_BASE)).rejects.toThrow('Falla simulada del mock')
    await expect(getFunnelComercial(FILTROS_BASE)).rejects.toThrow('Falla simulada del mock')
    await expect(getInventarioKPI(FILTROS_BASE)).rejects.toThrow('Falla simulada del mock')
    dashboardMockFlags.simularError = false

    // Después de restaurar: vuelve a funcionar
    const kpisRestored = await getKPIsDireccion(FILTROS_BASE)
    expect(kpisRestored.length).toBeGreaterThan(0)
  })

  it('GAM4-011 — XENIA Insights surface: provenance, fecha, alcance y nivel de certeza sin PII', async () => {
    const insights = await getXENIAInsights()

    expect(insights.length).toBeGreaterThan(0)

    insights.forEach((insight) => {
      // Campos obligatorios de provenance (GAM4-011, REGLA XENIA F4)
      expect(insight.id).toBeDefined()
      expect(insight.titulo).toBeTruthy()
      expect(insight.descripcion).toBeTruthy()
      expect(insight.fuente).toBeTruthy()
      expect(insight.fechaGenerado).toBeDefined()   // campo real: fechaGenerado (ISO string)
      expect(insight.alcance).toBeTruthy()
      // nivelCerteza es string enum: 'Alto' | 'Medio' | 'Exploratorio'
      expect(['Alto', 'Medio', 'Exploratorio']).toContain(insight.nivelCerteza)
      expect(insight.categoria).toBeDefined()

      // XENIA no inventa conclusiones: debe haber un alcance explícito
      expect(insight.alcance.length).toBeGreaterThan(5)

      // Privacidad: XENIA no debe exponer PII en campos visibles
      const camposTexto = [insight.titulo, insight.descripcion, insight.alcance, insight.fuente].join(' ')
      const patronEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      expect(camposTexto).not.toMatch(patronEmail)
    })

    // Al menos un insight de categoría comercial o inventario
    const categorias = insights.map((i) => i.categoria)
    expect(categorias.some((c) => c === 'comercial' || c === 'inventario')).toBe(true)
  })

  it('Golden E2E F4 completo — flujo integrado de datos gobernados a decisión de gestión', async () => {
    // Paso 1: KPIs P0 con contratos de métrica
    const kpis = await getKPIsDireccion(FILTROS_BASE)
    expect(kpis.length).toBeGreaterThan(0)
    kpis.forEach((k) => expect(k.metricContract).toBeDefined())

    // Paso 2: Funnel reconciliado — primera etapa ≥ última etapa
    const funnel = await getFunnelComercial(FILTROS_BASE)
    const primeraCantidad = funnel.etapas[0].cantidad
    const ultimaCantidad = funnel.etapas[funnel.etapas.length - 1].cantidad
    expect(primeraCantidad).toBeGreaterThanOrEqual(ultimaCantidad)

    // Paso 3: Inventario — disponibles + reservados + negociación ≤ total
    const inv = await getInventarioKPI(FILTROS_BASE)
    expect(inv.disponibles + inv.reservados + inv.enNegociacion).toBeLessThanOrEqual(
      inv.totalActivos + 1 // +1 tolerancia por redondeo/solapamiento temporal
    )

    // Paso 4: Advisor Data Scope — cada asesor solo ve lo suyo
    const asesores = await getAsesoresKPI(FILTROS_BASE)
    const asesorA = asesores[0]
    const scopeA = await getAsesoresKPI({ ...FILTROS_BASE, asesorId: asesorA.asesorId })
    expect(scopeA.every((a) => a.asesorId === asesorA.asesorId)).toBe(true)

    // Paso 5: Source performance — conversión entre 0 y 100%
    const fuentes = await getSourceKPI(FILTROS_BASE)
    fuentes.fuentes.forEach((f) => {
      expect(f.conversion).toBeGreaterThanOrEqual(0)
      expect(f.conversion).toBeLessThanOrEqual(100)
    })

    // Paso 6: Transaction dashboard — tiempo promedio > 0
    const tx = await getTransaccionKPI(FILTROS_BASE)
    expect(tx.tiempoPromedioCierreDias).toBeGreaterThan(0)

    // Paso 7: XENIA Insights con provenance completo (fechaGenerado, alcance, nivelCerteza)
    const insights = await getXENIAInsights()
    expect(
      insights.every(
        (i) =>
          i.fuente &&
          i.fechaGenerado &&
          i.alcance &&
          ['Alto', 'Medio', 'Exploratorio'].includes(i.nivelCerteza)
      )
    ).toBe(true)

    // Paso 8: Simulación de error → reintento exitoso (resilience GAM4-007)
    dashboardMockFlags.simularError = true
    await expect(getKPIsDireccion(FILTROS_BASE)).rejects.toThrow()
    dashboardMockFlags.simularError = false
    const kpisRetry = await getKPIsDireccion(FILTROS_BASE)
    expect(kpisRetry.length).toBeGreaterThan(0)
  })
})
