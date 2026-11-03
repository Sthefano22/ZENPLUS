import { formatNumero } from './format'

const SLOT = 88
const ALTO = 190
const BASE = 150
const TOPE = 28
const MAX_CHARS = 12

function envolver(label: string): string[] {
  if (label.length <= MAX_CHARS) return [label]
  const lineas: string[] = []
  let actual = ''
  for (const palabra of label.split(' ')) {
    if (actual && (actual + ' ' + palabra).length > MAX_CHARS) {
      lineas.push(actual)
      actual = palabra
    } else {
      actual = actual ? `${actual} ${palabra}` : palabra
    }
  }
  if (actual) lineas.push(actual)
  return lineas.slice(0, 2)
}

export default function MiniBarChart({
  datos,
  titulo,
  unidad,
  colorClass = 'fill-primary',
}: {
  datos: { label: string; valor: number }[]
  titulo: string
  unidad?: string
  /** Clase de relleno SVG (ej. "fill-primary" o "fill-secondary"). */
  colorClass?: string
}) {
  const max = Math.max(...datos.map((d) => d.valor), 1)
  const descripcion = `${titulo}: ${datos
    .map((d) => `${d.label} ${formatNumero(d.valor)}${unidad ? ` ${unidad}` : ''}`)
    .join(', ')}`

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-low p-5">
      <h3 className="font-syne text-sm font-semibold text-on-surface">
        {titulo}
        {unidad && <span className="ml-1 font-hanken font-normal text-on-surface-variant">({unidad})</span>}
      </h3>
      <svg
        role="img"
        aria-label={descripcion}
        viewBox={`0 0 ${datos.length * SLOT} ${ALTO}`}
        className="mx-auto mt-3 h-auto max-h-64 w-full"
      >
        <line x1="0" x2={datos.length * SLOT} y1={BASE} y2={BASE} className="stroke-outline-variant" strokeWidth="1" />
        {datos.map((d, i) => {
          const alto = (d.valor / max) * (BASE - TOPE)
          const cx = i * SLOT + SLOT / 2
          return (
            <g key={d.label}>
              <rect
                x={cx - 18}
                y={BASE - alto}
                width="36"
                height={alto}
                rx="3"
                className={`${colorClass} stroke-outline`}
                strokeWidth="1"
              />
              <text x={cx} y={BASE - alto - 6} textAnchor="middle" className="fill-on-surface font-hanken" fontSize="12" fontWeight="600">
                {formatNumero(d.valor)}
              </text>
              <text x={cx} y={BASE + 16} textAnchor="middle" className="fill-on-surface-variant font-hanken" fontSize="11">
                {envolver(d.label).map((linea, j) => (
                  <tspan key={j} x={cx} dy={j === 0 ? 0 : 13}>
                    {linea}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
