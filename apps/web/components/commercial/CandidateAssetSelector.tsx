'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  getEligibleCandidateProperties,
  type CandidatePropertySummary,
} from '@/lib/api-inventory-eligible'
import { trackCandidateAssetSelected } from './candidateAssetSelection'
import type { Requirement } from '@/types'
import LoadingRows from './LoadingRows'
import EmptyState from './EmptyState'

interface CandidateAssetSelectorProps {
  opportunityId: string
  requirement?: Requirement | null
  selectedSlug?: string
  onSelect: (propiedad: CandidatePropertySummary) => void
  disabled?: boolean
}

export default function CandidateAssetSelector({
  opportunityId,
  requirement,
  selectedSlug,
  onSelect,
  disabled = false,
}: CandidateAssetSelectorProps) {
  const [candidatos, setCandidatos] = useState<CandidatePropertySummary[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTexto, setFiltroTexto] = useState('')

  const cargarCandidatos = useCallback(async () => {
    setCargando(true)
    setError(null)

    const res = await getEligibleCandidateProperties({
      operacion: requirement?.operacion,
      tipos: requirement?.tipos,
      distritos: requirement?.distritos,
      presupuestoMin: requirement?.presupuestoMin,
      presupuestoMax: requirement?.presupuestoMax,
      areaMinM2: requirement?.areaMinM2,
      dormitoriosMin: requirement?.dormitoriosMin,
    })

    if (!res.ok) {
      setError(res.message || 'No fue posible cargar el inventario de propiedades candidatas.')
    } else {
      setCandidatos(res.data)
    }
    setCargando(false)
  }, [requirement])

  useEffect(() => {
    cargarCandidatos()
  }, [cargarCandidatos])

  function handleSelect(candidato: CandidatePropertySummary) {
    if (disabled) return
    trackCandidateAssetSelected(opportunityId, candidato.slug)
    onSelect(candidato)
  }

  const candidatosFiltrados = candidatos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.distrito.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="candidate-search"
          className="font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
        >
          Propiedad Candidata (Inventario Elegible)
        </label>
        {candidatos.length > 0 && (
          <input
            id="candidate-search"
            type="search"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Filtrar por nombre o distrito..."
            className="rounded-lg border border-outline-variant bg-surface-mid px-3 py-1.5 font-hanken text-xs text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
          />
        )}
      </div>

      {cargando ? (
        <LoadingRows rows={2} />
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-error/30 bg-error/10 p-3 font-hanken text-xs text-error"
        >
          {error}
          <button
            type="button"
            onClick={cargarCandidatos}
            className="ml-2 font-semibold underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      ) : candidatosFiltrados.length === 0 ? (
        <EmptyState
          titulo="Sin propiedades elegibles"
          descripcion={
            filtroTexto
              ? 'No hay propiedades que coincidan con la búsqueda.'
              : 'No se encontraron propiedades en inventario que cumplan con todos los requisitos actuales.'
          }
        />
      ) : (
        <div
          role="radiogroup"
          aria-label="Seleccionar propiedad candidata"
          className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1 sm:grid-cols-2"
        >
          {candidatosFiltrados.map((c) => {
            const isSelected = selectedSlug === c.slug
            const isReservada = c.estadoComercial === 'Reservado'

            return (
              <div
                key={c.id}
                role="radio"
                tabIndex={disabled ? -1 : 0}
                aria-checked={isSelected}
                aria-disabled={disabled}
                onClick={() => handleSelect(c)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleSelect(c)
                  }
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-outline-variant bg-surface-mid hover:border-outline'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-low">
                  <Image
                    src={c.imagen}
                    alt={c.titulo}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate font-syne text-xs font-bold text-on-surface">
                      {c.titulo}
                    </p>
                    <span
                      className={`inline-block flex-shrink-0 rounded px-1.5 py-0.5 font-hanken text-[10px] font-semibold ${
                        isReservada
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {c.estadoComercial}
                    </span>
                  </div>
                  <p className="font-hanken text-[11px] text-on-surface-variant">
                    {c.distrito} · {c.areaM2} m² · {c.dormitorios} dorm
                  </p>
                  <p className="mt-0.5 font-hanken text-xs font-semibold text-primary">
                    {c.moneda} ${c.precio.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
