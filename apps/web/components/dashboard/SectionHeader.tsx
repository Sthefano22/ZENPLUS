import StaleDataBadge from './StaleDataBadge'

export default function SectionHeader({
  titulo,
  descripcion,
  lastUpdated,
  isStale,
  accion,
  as: Titulo = 'h2',
}: {
  titulo: string
  descripcion?: string
  lastUpdated?: string
  isStale?: boolean
  accion?: React.ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <Titulo className="font-syne text-xl font-bold text-on-surface sm:text-2xl">{titulo}</Titulo>
        {descripcion && (
          <p className="mt-1 max-w-3xl font-hanken text-sm text-on-surface-variant">{descripcion}</p>
        )}
        {lastUpdated && <StaleDataBadge isStale={!!isStale} lastUpdated={lastUpdated} className="mt-2" />}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}
