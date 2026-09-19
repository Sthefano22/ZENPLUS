'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest px-6 pb-8 pt-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-5">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-syne text-base font-bold text-on-primary">
              Z
            </span>
            <span className="font-syne text-lg font-bold text-primary">ZENPLUS</span>
          </Link>
          <p className="mt-4 max-w-xs font-hanken text-sm text-on-surface-variant">
            Construimos bienestar, creamos patrimonio.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-hanken text-xs font-semibold uppercase tracking-widest text-on-surface">Empresa</h4>
          <Link href="/nosotros" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Nosotros</Link>
          <Link href="/prensa" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Prensa</Link>
          <Link href="/carreras" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Trabaja con nosotros</Link>
          <Link href="/contacto" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Contacto</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-hanken text-xs font-semibold uppercase tracking-widest text-on-surface">Propiedades</h4>
          <Link href="/buscar?operacion=venta" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Comprar</Link>
          <Link href="/buscar?operacion=alquiler" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Alquilar</Link>
          <Link href="/proyectos" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Proyectos</Link>
          <Link href="/publicar" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Publicar</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-hanken text-xs font-semibold uppercase tracking-widest text-on-surface">Síguenos</h4>
          <a href="#" target="_blank" rel="noreferrer" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Instagram</a>
          <a href="#" target="_blank" rel="noreferrer" className="font-hanken text-sm text-on-surface-variant hover:text-primary">LinkedIn</a>
          <a href="#" target="_blank" rel="noreferrer" className="font-hanken text-sm text-on-surface-variant hover:text-primary">Facebook</a>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-outline-variant pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-hanken text-sm text-on-surface-variant">
            Recibe nuevas propiedades exclusivas antes que nadie.
          </p>
          {enviado ? (
            <p className="font-hanken text-sm text-primary">Gracias por suscribirte.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setEnviado(true)
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-56 rounded-lg border border-outline-variant bg-surface-low px-4 py-2.5 font-hanken text-sm text-on-surface outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 font-hanken text-sm font-semibold text-on-primary"
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl font-hanken text-xs text-outline">
        © {new Date().getFullYear()} ZENPLUS.pe — Todos los derechos reservados.
      </p>
    </footer>
  )
}
