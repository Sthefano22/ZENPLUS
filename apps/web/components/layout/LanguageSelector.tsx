'use client'

import { useLocale } from 'next-intl'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'

export interface Language {
  code: string
  name: string
}

// Sin banderas emoji: en Windows se muestran como letras ("ES") y duplican el código.
const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
]

export default function LanguageSelector() {
  const locale = useLocale()
  const router = useRouter()
  // usePathname de next-intl devuelve la ruta SIN el prefijo de idioma
  const pathname = usePathname()

  const actual = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  const cambiarIdioma = (codigo: string) => {
    if (codigo === locale) return
    // Se conserva la ruta y los filtros (?operacion=venta, etc.)
    const query = typeof window !== 'undefined' ? window.location.search : ''
    router.replace(`${pathname}${query}`, { locale: codigo })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Idioma: ${actual.name}`}
          className="group flex h-10 items-center gap-2 rounded-full border border-outline-variant px-3.5 font-hanken text-sm font-medium text-on-surface transition-colors hover:bg-surface-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[state=open]:bg-surface-high"
        >
          <Globe size={16} strokeWidth={1.8} aria-hidden="true" />
          <span className="uppercase tracking-wide">{actual.code}</span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="menu-pop z-[70] min-w-[11rem] rounded-xl border border-outline-variant bg-surface-mid p-1.5 shadow-xl"
        >
          {LANGUAGES.map((lang) => {
            const activo = lang.code === locale
            return (
              <DropdownMenu.Item
                key={lang.code}
                lang={lang.code}
                onSelect={() => cambiarIdioma(lang.code)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2 font-hanken text-sm outline-none transition-colors data-[highlighted]:bg-surface-high ${
                  activo ? 'font-semibold text-primary' : 'text-on-surface'
                }`}
              >
                <span>{lang.name}</span>
                {activo ? (
                  <Check size={16} strokeWidth={2.2} aria-hidden="true" />
                ) : (
                  <span className="text-xs uppercase text-on-surface-variant">{lang.code}</span>
                )}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
