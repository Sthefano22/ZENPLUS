import { AlertCircle } from 'lucide-react'

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface-low py-12 text-center"
    >
      <AlertCircle aria-hidden="true" className="h-8 w-8 text-error" />
      <p className="font-hanken text-sm text-on-surface">No se pudo cargar este dato. Intenta de nuevo.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-primary px-6 py-2.5 font-hanken text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  )
}
