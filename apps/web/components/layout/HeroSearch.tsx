'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco']

export default function HeroSearch() {
  const router = useRouter()
  const [operacion, setOperacion] = useState('venta')
  const [tipo, setTipo] = useState('')
  const [distrito, setDistrito] = useState('')

  function buscar() {
    const params = new URLSearchParams()
    params.set('operacion', operacion)
    if (tipo) params.set('tipo', tipo)
    if (distrito) params.set('distrito', distrito)
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
        alt="Interior de lujo en Lima"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/60 to-surface" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-hanken text-xs font-semibold uppercase tracking-[0.2em] text-primary"
        >
          ZENPLUS PERU · DESARROLLO INMOBILIARIO
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 font-syne text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          Encontrá tu próxima propiedad de lujo en Lima
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="mx-auto mt-6 max-w-xl font-hanken text-lg font-light text-on-surface-variant"
        >
          Penthouses, departamentos, casas y oficinas exclusivas en San Isidro, Miraflores,
          La Molina y Barranco.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.48 }}
          className="mt-10 rounded-2xl border border-outline-variant bg-surface-low/90 p-3 text-left backdrop-blur-md"
        >
          <div className="flex gap-1 p-1 pb-3">
            <button
              type="button"
              onClick={() => setOperacion('venta')}
              className={`rounded-full px-5 py-2 font-hanken text-sm font-semibold ${
                operacion === 'venta' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Comprar
            </button>
            <button
              type="button"
              onClick={() => setOperacion('alquiler')}
              className={`rounded-full px-5 py-2 font-hanken text-sm font-semibold ${
                operacion === 'alquiler' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Alquilar
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none"
            >
              <option value="">Distrito</option>
              {DISTRITOS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-mid px-4 py-3.5 font-hanken text-sm text-on-surface outline-none"
            >
              <option value="">Tipo de propiedad</option>
              <option value="penthouse">Penthouse</option>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="oficina">Oficina</option>
            </select>

            <motion.button
              type="button"
              onClick={buscar}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="whitespace-nowrap rounded-lg bg-primary px-8 py-3.5 font-hanken text-sm font-semibold text-on-primary"
            >
              Buscar
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-1 font-hanken text-sm text-on-surface-variant"
        >
          {['Departamentos', 'Casas', 'Penthouses', 'Oficinas'].map((t, i, arr) => (
            <span key={t} className="flex items-center gap-2">
              <Link href={`/buscar?tipo=${t.toLowerCase().slice(0, -1)}`} className="hover:text-primary">
                {t}
              </Link>
              {i < arr.length - 1 && <span className="text-outline">·</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
