import type { EstadoOpportunity } from '@/types'

const ESTILOS: Record<EstadoOpportunity, string> = {
  Nueva: 'bg-surface-mid text-on-surface-variant',
  Calificada: 'bg-white/10 text-primary border border-outline-variant',
  'En Proceso': 'bg-white/10 text-secondary border border-outline-variant',
  'Oferta Enviada': 'bg-transparent text-primary border border-primary',
  Reservada: 'bg-primary text-on-primary',
  'Cerrada Ganada': 'bg-primary-container/20 text-primary font-bold border border-outline-variant',
  'Cerrada Perdida': 'bg-white/5 text-on-surface-variant border border-outline-variant',
}

export default function OpportunityBadge({ estado }: { estado: EstadoOpportunity }) {
  return (
    <span
      aria-label={estado}
      className={`inline-flex items-center rounded-full px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${ESTILOS[estado]}`}
    >
      {estado}
    </span>
  )
}
