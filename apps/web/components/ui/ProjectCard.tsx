'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import type { Proyecto } from '@/types'

export default function ProjectCard({ proyecto, index = 0 }: { proyecto: Proyecto; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      id={proyecto.slug}
      className="scroll-mt-28 overflow-hidden rounded-xl border border-outline-variant bg-surface-low"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={proyecto.imagen}
          alt={proyecto.nombre}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider text-on-primary">
          {proyecto.estado}
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-syne text-xl font-semibold text-on-surface">{proyecto.nombre}</h3>
        <p className="mt-1 font-hanken text-sm text-on-surface-variant">
          {proyecto.distrito} · {proyecto.niveles} niveles · {proyecto.unidadesDisponibles} de {proyecto.unidades} unidades disponibles
        </p>
        <p className="mt-3 font-hanken text-sm text-on-surface-variant">{proyecto.descripcion}</p>

        {typeof proyecto.avanceConstruccion === 'number' && (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between font-hanken text-xs text-on-surface-variant">
              <span>Avance de construcción</span>
              <span>{proyecto.avanceConstruccion}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-mid">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: `${proyecto.avanceConstruccion}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-outline-variant pt-4">
          <div>
            <p className="font-hanken text-xs text-on-surface-variant">Desde</p>
            <p className="font-syne text-lg font-semibold text-primary">
              USD ${new Intl.NumberFormat('en-US').format(proyecto.precioDesde)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-hanken text-xs text-on-surface-variant">CAP Rate</p>
            <p className="font-syne text-lg font-semibold text-on-surface">{proyecto.capRate}%</p>
          </div>
          <span className="rounded-full border border-outline-variant px-3 py-1.5 font-hanken text-[11px] text-on-surface-variant">
            {proyecto.certificacion}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
