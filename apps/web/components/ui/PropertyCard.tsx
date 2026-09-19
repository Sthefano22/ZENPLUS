'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import type { PropiedadResumen } from '@/types'
import Badge from './Badge'

function formatearPrecio(precio: number, operacion: PropiedadResumen['operacion']) {
  const formato = new Intl.NumberFormat('en-US').format(precio)
  return operacion === 'alquiler' ? `USD $${formato}/mes` : `USD $${formato}`
}

export default function PropertyCard({
  propiedad,
  index = 0,
}: {
  propiedad: PropiedadResumen
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/propiedad/${propiedad.slug}`}
        className="group block overflow-hidden rounded-xl border border-outline-variant bg-surface-low transition-colors hover:border-outline"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={propiedad.imagen}
            alt={propiedad.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4">
            <Badge estado={propiedad.estado} />
          </div>
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-surface/60 px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider text-on-surface backdrop-blur-sm">
              {propiedad.operacion === 'venta' ? 'Venta' : 'Alquiler'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <p className="font-syne text-xl font-semibold text-primary">
            {formatearPrecio(propiedad.precio, propiedad.operacion)}
          </p>
          <h3 className="mt-1 font-syne text-lg font-semibold text-on-surface">
            {propiedad.titulo}
          </h3>
          <p className="mt-1 font-hanken text-sm text-on-surface-variant">{propiedad.ubicacion}</p>

          <div className="mt-4 flex items-center gap-3 border-t border-outline-variant pt-3 font-hanken text-sm text-secondary">
            <span>{propiedad.areaM2} m²</span>
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span>{propiedad.dormitorios} dorm.</span>
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span>{propiedad.banos} baños</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
