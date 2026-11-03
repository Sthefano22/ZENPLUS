'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { MetricContract } from '@/types'
import { trackEvent } from '@/lib/analytics'

export default function KPITooltip({
  contract,
  children,
}: {
  contract: MetricContract
  children: React.ReactNode
}) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [abierto, setAbierto] = useState(false)
  const [alinearDerecha, setAlinearDerecha] = useState(false)

  function abrir() {
    if (abierto) return
    const rect = ref.current?.getBoundingClientRect()
    // Tooltip de 16rem (256px): si no cabe hacia la derecha, se ancla al borde derecho
    setAlinearDerecha(!!rect && rect.left + 256 > window.innerWidth - 16)
    setAbierto(true)
    trackEvent('kpi_definition_opened', { kpiId: contract.id, kpiLabel: contract.nombre })
  }

  useEffect(() => {
    if (!abierto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto])

  return (
    <div
      ref={ref}
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={abrir}
      onMouseLeave={() => setAbierto(false)}
      onFocus={abrir}
      onBlur={() => setAbierto(false)}
      className="relative h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
      <div
        id={id}
        role="tooltip"
        className={`absolute top-full z-30 mt-2 w-64 rounded-xl border border-outline-variant bg-surface-high p-4 text-left shadow-lg ${
          alinearDerecha ? 'right-0' : 'left-0'
        } ${abierto ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <p className="font-syne text-sm font-semibold text-on-surface">{contract.nombre}</p>
        <p className="mt-1 font-hanken text-xs text-on-surface-variant">{contract.descripcion}</p>
        <dl className="mt-3 space-y-1.5 font-hanken text-xs">
          <div>
            <dt className="text-on-surface-variant">Fórmula</dt>
            <dd className="text-on-surface">{contract.formula}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Fuente</dt>
            <dd className="text-on-surface">{contract.fuente}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Frescura esperada</dt>
            <dd className="text-on-surface">Cada {contract.freshnessMinutos} min</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
