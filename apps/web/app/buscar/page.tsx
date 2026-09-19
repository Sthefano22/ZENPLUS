'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import PropertyCard from '@/components/ui/PropertyCard'
import Skeleton from '@/components/ui/Skeleton'
import { getProperties } from '@/lib/api'
import type { FiltrosBusqueda, Operacion, PropiedadResumen, TipoPropiedad } from '@/types'

const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco']

const selectClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3 font-hanken text-sm text-on-surface outline-none focus:border-primary'

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    operacion: (searchParams.get('operacion') as Operacion) || undefined,
    tipo: (searchParams.get('tipo') as TipoPropiedad) || undefined,
    distrito: searchParams.get('distrito') || undefined,
  })
  const [resultados, setResultados] = useState<PropiedadResumen[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    getProperties(filtros).then((data) => {
      setResultados(data)
      setCargando(false)
    })
  }, [filtros])

  function actualizar<K extends keyof FiltrosBusqueda>(key: K, value: FiltrosBusqueda[K]) {
    setFiltros((prev) => ({ ...prev, [key]: value || undefined }))
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">Búsqueda</p>
      <h1 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
        Encuentra tu próxima propiedad
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        
        <aside className="h-fit rounded-xl border border-outline-variant bg-surface-low p-6">
          <div className="mb-6 flex gap-1">
            <button
              onClick={() => actualizar('operacion', 'venta')}
              className={`flex-1 rounded-full px-4 py-2 font-hanken text-sm font-semibold ${
                !filtros.operacion || filtros.operacion === 'venta' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Venta
            </button>
            <button
              onClick={() => actualizar('operacion', 'alquiler')}
              className={`flex-1 rounded-full px-4 py-2 font-hanken text-sm font-semibold ${
                filtros.operacion === 'alquiler' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Alquiler
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <select className={selectClass} value={filtros.tipo ?? ''} onChange={(e) => actualizar('tipo', e.target.value as TipoPropiedad)}>
              <option value="">Tipo de propiedad</option>
              <option value="penthouse">Penthouse</option>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
            </select>

            <select className={selectClass} value={filtros.distrito ?? ''} onChange={(e) => actualizar('distrito', e.target.value)}>
              <option value="">Distrito</option>
              {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              className={selectClass}
              value={filtros.dormitorios ?? ''}
              onChange={(e) => actualizar('dormitorios', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Dormitorios</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ dorm.</option>)}
            </select>

            <select
              className={selectClass}
              value={filtros.precioMax ?? ''}
              onChange={(e) => actualizar('precioMax', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Precio máximo</option>
              <option value="500000">Hasta $500,000</option>
              <option value="1500000">Hasta $1,500,000</option>
              <option value="3000000">Hasta $3,000,000</option>
              <option value="5000000">Hasta $5,000,000</option>
            </select>
          </div>
        </aside>

        
        <div>
          <p className="mb-6 font-hanken text-sm text-on-surface-variant">
            {cargando ? 'Buscando...' : `${resultados.length} propiedades encontradas`}
          </p>

          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {cargando ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : (
              <AnimatePresence>
                {resultados.map((p, i) => <PropertyCard key={p.id} propiedad={p} index={i} />)}
              </AnimatePresence>
            )}
          </div>

          {!cargando && resultados.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center font-hanken text-on-surface-variant"
            >
              No encontramos propiedades con esos filtros. Prueba ajustando la búsqueda.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
