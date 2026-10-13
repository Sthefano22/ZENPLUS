'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'
import { updateRequirement } from '@/lib/api-commercial'
import type { Requirement, Operacion, TipoPropiedad } from '@/types'

const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco']
const TIPOS: { value: TipoPropiedad; label: string }[] = [
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
]

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-[15px] text-on-surface outline-none placeholder:text-outline focus:border-primary transition-colors'

type Estado = 'idle' | 'guardando' | 'guardado' | 'error'

export default function RequirementForm({
  requirement,
  opportunityId,
  onSave,
}: {
  requirement: Requirement | null
  opportunityId: string
  onSave: (data: Partial<Requirement>) => void
}) {
  const [operacion, setOperacion] = useState<Operacion | ''>(requirement?.operacion ?? '')
  const [tipos, setTipos] = useState<TipoPropiedad[]>(requirement?.tipos ?? [])
  const [distritos, setDistritos] = useState<string[]>(requirement?.distritos ?? [])
  const [presupuestoMin, setPresupuestoMin] = useState(requirement?.presupuestoMin?.toString() ?? '')
  const [presupuestoMax, setPresupuestoMax] = useState(requirement?.presupuestoMax?.toString() ?? '')
  const [areaMinM2, setAreaMinM2] = useState(requirement?.areaMinM2?.toString() ?? '')
  const [dormitoriosMin, setDormitoriosMin] = useState(requirement?.dormitoriosMin?.toString() ?? '')
  const [notas, setNotas] = useState(requirement?.notas ?? '')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [estado, setEstado] = useState<Estado>('idle')

  function alternarTipo(t: TipoPropiedad) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function alternarDistrito(d: string) {
    setDistritos((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!operacion) e.operacion = 'Selecciona una operación.'
    if (tipos.length === 0) e.tipos = 'Selecciona al menos un tipo de propiedad.'
    const min = presupuestoMin ? Number(presupuestoMin) : undefined
    const max = presupuestoMax ? Number(presupuestoMax) : undefined
    if (typeof min === 'number' && typeof max === 'number' && max < min) {
      e.presupuestoMax = 'El presupuesto máximo debe ser mayor o igual al mínimo.'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return

    const data: Partial<Requirement> = {
      operacion: operacion as Operacion,
      tipos,
      distritos,
      presupuestoMin: presupuestoMin ? Number(presupuestoMin) : undefined,
      presupuestoMax: presupuestoMax ? Number(presupuestoMax) : undefined,
      areaMinM2: areaMinM2 ? Number(areaMinM2) : undefined,
      dormitoriosMin: dormitoriosMin ? Number(dormitoriosMin) : undefined,
      notas: notas.trim() ? notas : undefined,
    }

    setEstado('guardando')
    const res = await updateRequirement(opportunityId, data)
    setEstado(res.ok ? 'guardado' : 'error')
    if (res.ok) onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="operacion" className="font-hanken text-[13px] text-on-surface-variant">
          Operación
        </label>
        <select
          id="operacion"
          aria-required="true"
          className={inputClass}
          value={operacion}
          onChange={(e) => setOperacion(e.target.value as Operacion)}
        >
          <option value="">Seleccionar...</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
        {errores.operacion && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.operacion}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-hanken text-[13px] text-on-surface-variant">Tipos de propiedad</span>
        <div className="flex flex-wrap gap-3">
          {TIPOS.map((t) => (
            <label
              key={t.value}
              htmlFor={`tipo-${t.value}`}
              className="flex items-center gap-2 font-hanken text-sm text-on-surface"
            >
              <input
                id={`tipo-${t.value}`}
                type="checkbox"
                checked={tipos.includes(t.value)}
                onChange={() => alternarTipo(t.value)}
                className="h-4 w-4 rounded border-outline-variant accent-[color:var(--color-primary)]"
              />
              {t.label}
            </label>
          ))}
        </div>
        {errores.tipos && (
          <p aria-live="polite" className="font-hanken text-xs text-error">
            {errores.tipos}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-hanken text-[13px] text-on-surface-variant">Distritos</span>
        <div className="flex flex-wrap gap-3">
          {DISTRITOS.map((d) => (
            <label
              key={d}
              htmlFor={`distrito-${d}`}
              className="flex items-center gap-2 font-hanken text-sm text-on-surface"
            >
              <input
                id={`distrito-${d}`}
                type="checkbox"
                checked={distritos.includes(d)}
                onChange={() => alternarDistrito(d)}
                className="h-4 w-4 rounded border-outline-variant accent-[color:var(--color-primary)]"
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="presupuestoMin" className="font-hanken text-[13px] text-on-surface-variant">
            Presupuesto mínimo (USD)
          </label>
          <input
            id="presupuestoMin"
            type="number"
            className={inputClass}
            value={presupuestoMin}
            onChange={(e) => setPresupuestoMin(e.target.value)}
            placeholder="500000"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="presupuestoMax" className="font-hanken text-[13px] text-on-surface-variant">
            Presupuesto máximo (USD)
          </label>
          <input
            id="presupuestoMax"
            type="number"
            className={inputClass}
            value={presupuestoMax}
            onChange={(e) => setPresupuestoMax(e.target.value)}
            placeholder="1500000"
          />
          {errores.presupuestoMax && (
            <p aria-live="polite" className="font-hanken text-xs text-error">
              {errores.presupuestoMax}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="areaMinM2" className="font-hanken text-[13px] text-on-surface-variant">
          Área mínima (m²)
        </label>
        <input
          id="areaMinM2"
          type="number"
          className={inputClass}
          value={areaMinM2}
          onChange={(e) => setAreaMinM2(e.target.value)}
          placeholder="150"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dormitoriosMin" className="font-hanken text-[13px] text-on-surface-variant">
          Dormitorios mínimos
        </label>
        <select
          id="dormitoriosMin"
          className={inputClass}
          value={dormitoriosMin}
          onChange={(e) => setDormitoriosMin(e.target.value)}
        >
          <option value="">Sin preferencia</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ dorm.
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notas" className="font-hanken text-[13px] text-on-surface-variant">
          Notas
        </label>
        <textarea
          id="notas"
          rows={3}
          className={inputClass}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Preferencias adicionales del cliente..."
        />
      </div>

      {estado === 'error' && (
        <p aria-live="polite" className="font-hanken text-sm text-error">
          No se pudo guardar el requirement. Intenta nuevamente.
        </p>
      )}
      {estado === 'guardado' && (
        <p aria-live="polite" className="font-hanken text-sm text-primary">
          Requirement guardado.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={estado === 'guardando'}
        aria-disabled={estado === 'guardando'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-1 self-start rounded-full bg-primary px-6 py-3.5 font-hanken text-[15px] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'guardando' ? 'Guardando...' : 'Guardar requirement'}
      </motion.button>
    </form>
  )
}
