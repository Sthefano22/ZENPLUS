import type { TimelineEvento } from '@/types'

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconVisita() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  )
}

function IconOferta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconReserva() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M12 2l3 6 6.5 1-4.7 4.5 1.1 6.5L12 17l-5.9 3 1.1-6.5L2.5 9l6.5-1z" />
    </svg>
  )
}

function IconNota() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M6 4h9l5 5v11H6z" />
      <path d="M15 4v5h5" />
    </svg>
  )
}

function IconEstado() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconHito() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function IconDocumento() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function IconPago() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

const ICONOS: Record<TimelineEvento['tipo'], () => JSX.Element> = {
  visita: IconVisita,
  oferta: IconOferta,
  reserva: IconReserva,
  nota: IconNota,
  estado: IconEstado,
  hito: IconHito,
  documento: IconDocumento,
  pago: IconPago,
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

export default function CommercialTimeline({ eventos }: { eventos: TimelineEvento[] }) {
  if (eventos.length === 0) return null

  return (
    <ul className="flex flex-col gap-4">
      {eventos.map((evento) => {
        const Icono = ICONOS[evento.tipo]
        return (
          <li key={evento.id} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-mid text-primary">
              <Icono />
            </span>
            <div className="flex-1 border-b border-outline-variant pb-4">
              <p className="font-hanken text-sm text-on-surface">{evento.descripcion}</p>
              <p className="mt-1 font-hanken text-xs text-on-surface-variant">
                {formatearFecha(evento.fecha)}
                {evento.autor && ` · ${evento.autor}`}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
