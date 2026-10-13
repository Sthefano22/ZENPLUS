import type { EstadoOferta } from '@/types'

const ESTILOS: Record<EstadoOferta, string> = {
  Borrador: 'bg-surface-mid text-on-surface-variant',
  Enviada: 'bg-transparent text-primary border border-primary',
  'En Negociación': 'bg-white/10 text-secondary border border-outline-variant',
  Contraoferta: 'bg-primary-container/20 text-primary-container border border-outline-variant',
  Aceptada: 'bg-primary text-on-primary',
  Rechazada: 'bg-error/15 text-error',
  Expirada: 'bg-white/5 text-on-surface-variant border border-outline-variant',
}

export default function OfertaBadge({ estado }: { estado: EstadoOferta }) {
  return (
    <span
      aria-label={estado}
      className={`inline-flex items-center rounded-full px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${ESTILOS[estado]}`}
    >
      {estado}
    </span>
  )
}
