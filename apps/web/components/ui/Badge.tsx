import type { EstadoPropiedad } from '@/types'

const ESTILOS: Record<EstadoPropiedad, string> = {
  'Venta Exclusiva': 'bg-primary text-on-primary',
  'Alquiler Prime': 'bg-secondary text-surface',
  Disponible: 'bg-white/10 text-on-surface border border-outline-variant',
  'En Negociación': 'bg-primary-container/20 text-primary-container border border-outline-variant',
  'Oportunidad de Inversión': 'bg-secondary/20 text-secondary border border-outline-variant',
  Reservado: 'bg-error/15 text-error',
}

export default function Badge({ estado }: { estado: EstadoPropiedad }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${ESTILOS[estado]}`}
    >
      {estado}
    </span>
  )
}
