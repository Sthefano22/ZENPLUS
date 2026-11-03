import EmptyState from '@/components/commercial/EmptyState'
import LoadingRows from '@/components/commercial/LoadingRows'

export interface DataTableColumna {
  key: string
  label: string
  align?: 'left' | 'right'
}

export default function DataTable({
  columnas,
  filas,
  isLoading,
  isEmpty,
  emptyMessage = 'No hay datos para mostrar.',
  ariaLabel = 'Tabla de datos',
}: {
  columnas: DataTableColumna[]
  filas: Record<string, React.ReactNode>[]
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  ariaLabel?: string
}) {
  if (isLoading) return <LoadingRows rows={2} />
  if (isEmpty || filas.length === 0) {
    return <EmptyState titulo="Sin datos" descripcion={emptyMessage} />
  }

  return (
    <>
      {/* Desktop: tabla con header sticky (display:none en móvil la quita del árbol de accesibilidad) */}
      <div className="hidden rounded-xl border border-outline-variant bg-surface-low md:block">
        <table role="table" aria-label={ariaLabel} className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columnas.map((c, i) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`sticky top-14 z-10 border-b border-outline-variant bg-surface-mid px-4 py-3 font-hanken text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  } ${i === 0 ? 'rounded-tl-xl' : ''} ${i === columnas.length - 1 ? 'rounded-tr-xl' : ''}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} className="hover:bg-white/5">
                {columnas.map((c) => (
                  <td
                    key={c.key}
                    className={`border-b border-outline-variant px-4 py-3 font-hanken text-on-surface ${
                      c.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                    }`}
                  >
                    {fila[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: cada fila es una card apilada */}
      <ul aria-label={ariaLabel} className="flex flex-col gap-3 md:hidden">
        {filas.map((fila, i) => (
          <li key={i} className="rounded-xl border border-outline-variant bg-surface-low p-4">
            <dl className="space-y-2">
              {columnas.map((c) => (
                <div key={c.key} className="flex items-baseline justify-between gap-4">
                  <dt className="font-hanken text-xs text-on-surface-variant">{c.label}</dt>
                  <dd className="text-right font-hanken text-sm text-on-surface">{fila[c.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
