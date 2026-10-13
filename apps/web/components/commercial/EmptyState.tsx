'use client'

export default function EmptyState({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string
  descripcion: string
  accion?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface-low py-16 text-center">
      <h3 className="font-syne text-lg font-semibold text-on-surface">{titulo}</h3>
      <p className="max-w-sm font-hanken text-sm text-on-surface-variant">{descripcion}</p>
      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-2 rounded-full bg-primary px-6 py-2.5 font-hanken text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {accion.label}
        </button>
      )}
    </div>
  )
}
