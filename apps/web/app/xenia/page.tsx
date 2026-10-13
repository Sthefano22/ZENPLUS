import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Xenia | ZENPLUS',
  description: 'Xenia — tu asistente inteligente de bienes raíces en ZENPLUS.',
}

export default function XeniaPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary font-syne text-3xl font-bold text-on-primary">
        Z
      </span>
      <h1 className="mt-8 font-syne text-4xl font-bold text-on-surface">Xenia</h1>
      <p className="mt-3 max-w-md font-hanken text-lg text-on-surface-variant">
        Tu asistente inteligente de bienes raíces. Pronto podrás conversar con Xenia para encontrar la propiedad ideal, resolver dudas y conectarte con un asesor.
      </p>
      <p className="mt-6 font-hanken text-sm text-primary">
        Mientras tanto, usa el chat flotante en la esquina inferior derecha.
      </p>

      {process.env.NEXT_PUBLIC_CHAT_DEMO === 'true' && (
        <p className="mt-6 rounded-full border border-outline-variant bg-surface-low px-4 py-2 font-hanken text-xs text-on-surface-variant">
          Xenia está en modo demo. Las respuestas son simuladas.
        </p>
      )}

      <Link
        href="/contacto"
        className="mt-8 rounded-full bg-primary px-6 py-3 font-hanken text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Hablar con un asesor
      </Link>
    </div>
  )
}