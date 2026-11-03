import { getTranslations } from 'next-intl/server'
import { CalendarCheck, FileSignature, ChartNoAxesCombined, Search } from 'lucide-react'
import Reveal from './Reveal'

export default async function ComoFunciona() {
  const t = await getTranslations('home.comoFunciona')

  const PASOS = [
    { icon: Search, titulo: t('p1Titulo'), texto: t('p1Texto') },
    { icon: CalendarCheck, titulo: t('p2Titulo'), texto: t('p2Texto') },
    { icon: ChartNoAxesCombined, titulo: t('p3Titulo'), texto: t('p3Texto') },
    { icon: FileSignature, titulo: t('p4Titulo'), texto: t('p4Texto') },
  ]

  return (
    <section className="border-y border-outline-variant bg-surface-low py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">{t('etiqueta')}</p>
          <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">{t('titulo')}</h2>
        </Reveal>

        <div className="relative grid gap-12 md:grid-cols-4 md:gap-6">
          {/* Línea que une los pasos (centros de la 1.ª y la 4.ª columna) */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-outline-variant md:block"
          />
          {PASOS.map((p, i) => (
            <Reveal key={i} delay={i * 0.1} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-surface-mid text-primary shadow-sm">
                <p.icon size={26} strokeWidth={1.6} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary font-hanken text-xs font-bold text-on-primary">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-syne text-lg font-semibold text-on-surface">{p.titulo}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] font-hanken text-sm text-on-surface-variant">{p.texto}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
