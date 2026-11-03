import { AlertCircle } from 'lucide-react'
import { formatHora } from './format'

export default function StaleDataBadge({
  isStale,
  lastUpdated,
  className = '',
}: {
  isStale: boolean
  lastUpdated: string
  className?: string
}) {
  if (isStale) {
    return (
      <span
        role="status"
        className={`inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 font-hanken text-xs font-semibold text-on-primary-container ${className}`}
      >
        <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        Dato desactualizado · última actualización: {formatHora(lastUpdated)}
      </span>
    )
  }
  return (
    <span className={`block font-hanken text-xs text-on-surface-variant ${className}`}>
      Actualizado: {formatHora(lastUpdated)}
    </span>
  )
}
