'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

const BASE =
  'relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:bg-surface-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [montado, setMontado] = useState(false)

  useEffect(() => setMontado(true), [])

  // Antes de montar no se conoce el tema real: se reserva el espacio para evitar saltos
  if (!montado) return <span className={BASE} aria-hidden="true" />

  const esOscuro = resolvedTheme !== 'light'
  const etiqueta = esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  return (
    <button
      type="button"
      onClick={() => setTheme(esOscuro ? 'light' : 'dark')}
      aria-label={etiqueta}
      title={etiqueta}
      className={BASE}
    >
      <Sun
        size={18}
        strokeWidth={1.8}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          esOscuro ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
        }`}
      />
      <Moon
        size={18}
        strokeWidth={1.8}
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          esOscuro ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </button>
  )
}
