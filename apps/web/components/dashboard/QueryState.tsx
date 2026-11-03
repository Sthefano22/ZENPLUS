import EmptyState from '@/components/commercial/EmptyState'
import LoadingRows from '@/components/commercial/LoadingRows'
import ErrorState from './ErrorState'

/** Resuelve loading / error / vacío; si nada aplica renderiza children. */
export default function QueryState({
  loading,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'Sin datos para este periodo',
  emptyDescription = 'No hay datos disponibles con los filtros seleccionados.',
  rows = 2,
  children,
}: {
  loading: boolean
  error: boolean
  onRetry: () => void
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  rows?: number
  children: React.ReactNode
}) {
  if (loading) return <LoadingRows rows={rows} />
  if (error) return <ErrorState onRetry={onRetry} />
  if (isEmpty) return <EmptyState titulo={emptyTitle} descripcion={emptyDescription} />
  return <>{children}</>
}
