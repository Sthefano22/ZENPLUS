import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight, MapPin } from 'lucide-react'
import Reveal from './Reveal'
import { DISTRITOS, TIPOS } from './data'

// Atajos a /buscar con los filtros que la página ya entiende (tipo y distrito)
export default async function Explorar() {
  const t = await getTranslations('home.explorar')
  const th = await getTranslations('hero')

  return (
    <section id="explorar" className="scroll-mt-20 border-y border-outline-variant bg-surface-low py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">{t('etiqueta')}</p>
          <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">{t('titulo')}</h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <h3 className="mb-4 font-hanken text-sm font-semibold text-on-surface-variant">{t('porTipo')}</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {TIPOS.map((tipo) => (
              <Link
                key={tipo.tipo}
                href={`/buscar?tipo=${tipo.tipo}`}
                className="group relative flex flex-col gap-5 rounded-2xl border border-outline-variant bg-surface-mid p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
              >
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className="absolute right-5 top-5 text-on-surface-variant transition-colors group-hover:text-on-surface"
                />
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <tipo.icon size={22} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="font-syne text-lg font-semibold text-on-surface">{th(tipo.key)}</span>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <h3 className="mb-4 font-hanken text-sm font-semibold text-on-surface-variant">{t('porDistrito')}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {DISTRITOS.map((d) => (
              <Link
                key={d}
                href={`/buscar?${new URLSearchParams({ distrito: d }).toString()}`}
                className="group flex flex-col gap-3 rounded-2xl border border-outline-variant bg-gradient-to-br from-surface-mid to-surface-low p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
              >
                <MapPin size={18} strokeWidth={1.8} aria-hidden="true" className="text-primary" />
                <span className="font-syne text-base font-semibold text-on-surface">{d}</span>
                <span className="font-hanken text-xs text-on-surface-variant transition-colors group-hover:text-on-surface">
                  {t('verPropiedades')} →
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
