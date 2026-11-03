'use client'

import type { TransactionMilestone, EtapaOperacion } from '@/types'

const ETAPAS_ORDEN: EtapaOperacion[] = [
  'Iniciada',
  'Documentación',
  'Contrato',
  'Cierre',
  'Completada',
]

interface TransactionMilestonesProps {
  etapaActual: EtapaOperacion
  milestones: TransactionMilestone[]
}

export default function TransactionMilestones({
  etapaActual,
  milestones,
}: TransactionMilestonesProps) {
  const indiceActual = ETAPAS_ORDEN.indexOf(etapaActual)

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-low p-6">
      <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-on-surface">
        Ruta Transaccional
      </h3>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {ETAPAS_ORDEN.map((etapa, idx) => {
          const esPasada = idx < indiceActual
          const esActual = idx === indiceActual
          const ms = milestones.find((m) => m.etapa === etapa)
          const completado = ms?.completado || esPasada

          return (
            <div key={etapa} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:text-center">
              <div className="flex items-center gap-2 sm:flex-col">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-hanken text-xs font-bold transition-colors ${
                    completado
                      ? 'bg-emerald-500 text-neutral-900'
                      : esActual
                      ? 'border-2 border-primary bg-primary/20 text-primary'
                      : 'border border-outline-variant bg-surface text-on-surface-variant'
                  }`}
                >
                  {completado ? '✓' : idx + 1}
                </span>

                <div className="sm:mt-2">
                  <p
                    className={`font-hanken text-xs font-bold ${
                      esActual ? 'text-primary' : completado ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}
                  >
                    {etapa}
                  </p>
                  {ms?.fechaCompletado && (
                    <p className="hidden sm:block font-hanken text-[10px] text-on-surface-variant">
                      {new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(
                        new Date(ms.fechaCompletado)
                      )}
                    </p>
                  )}
                </div>
              </div>

              {idx < ETAPAS_ORDEN.length - 1 && (
                <div
                  className={`hidden sm:block sm:h-0.5 sm:w-full sm:flex-1 transition-colors ${
                    idx < indiceActual ? 'bg-emerald-500/60' : 'bg-outline-variant'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
