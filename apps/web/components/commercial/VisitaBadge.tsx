import type { EstadoVisita } from '@/types'

const ESTILOS: Record<EstadoVisita, string> = {
  Programada: 'bg-surface-mid text-on-surface-variant border border-outline-variant',
  Confirmada: 'bg-transparent text-primary border border-primary',
  Realizada: 'bg-primary text-on-primary',
  'No Show': 'bg-error/15 text-error',
  Cancelada: 'bg-error/15 text-error',
  Reprogramada: 'bg-white/10 text-secondary border border-outline-variant',
}

export default function VisitaBadge({ estado }: { estado: EstadoVisita }) {
  return (
    <span
      aria-label={estado}
      className={`inline-flex items-center rounded-full px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${ESTILOS[estado]}`}
    >
      {estado}
    </span>
  )
}
