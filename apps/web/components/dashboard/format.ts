export function minutosDesde(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatNumero(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export function formatUSD(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Color semántico de conversión: >5% primary, 2-5% neutro, <2% error. */
export function claseConversion(pct: number): string {
  if (pct > 5) return 'text-primary'
  if (pct >= 2) return 'text-on-surface'
  return 'text-error'
}

export const ETIQUETA_PERIODO: Record<string, string> = {
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  '90d': 'últimos 90 días',
  '12m': 'últimos 12 meses',
}
