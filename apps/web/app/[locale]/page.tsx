import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import HeroSearch from '@/components/layout/HeroSearch'
import PropertyCard from '@/components/ui/PropertyCard'
import ProjectCard from '@/components/ui/ProjectCard'
import Reveal from '@/components/home/Reveal'
import Explorar from '@/components/home/Explorar'
import ComoFunciona from '@/components/home/ComoFunciona'
import { BadgeCheck, ChartNoAxesCombined, Handshake } from 'lucide-react'
import { getFeaturedProperties, getProjects } from '@/lib/api'

export default async function Home() {
  const t = await getTranslations('home')
  const [destacadas, proyectos] = await Promise.all([getFeaturedProperties(), getProjects()])

  const RAZONES = [
    { icon: BadgeCheck, titulo: t('razones.r1Titulo'), texto: t('razones.r1Texto') },
    { icon: Handshake, titulo: t('razones.r2Titulo'), texto: t('razones.r2Texto') },
    { icon: ChartNoAxesCombined, titulo: t('razones.r3Titulo'), texto: t('razones.r3Texto') },
  ]

  return (
    <>
      <HeroSearch />

      <Explorar />

      
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
              {t('destacadas.etiqueta')}
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              {t('destacadas.titulo')}
            </h2>
          </div>
          <Link href="/buscar" className="font-hanken text-sm font-semibold text-primary">
            {t('destacadas.verTodas')} →
          </Link>
        </Reveal>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {destacadas.map((p, i) => (
            <PropertyCard key={p.id} propiedad={p} index={i} />
          ))}
        </div>
      </section>

      
      <section className="border-y border-outline-variant bg-surface-low py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
              {t('razones.etiqueta')}
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              {t('razones.titulo')}
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {RAZONES.map((r, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-outline-variant bg-surface-mid p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                  <span className="absolute right-6 top-4 font-syne text-5xl font-bold text-primary-container opacity-30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-high text-primary">
                    <r.icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-syne text-lg font-semibold text-on-surface">{r.titulo}</h3>
                  <p className="mt-2 font-hanken text-sm text-on-surface-variant">{r.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
              {t('proyectos.etiqueta')}
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              {t('proyectos.titulo')}
            </h2>
          </div>
          <Link href="/proyectos" className="font-hanken text-sm font-semibold text-primary">
            {t('proyectos.verTodos')} →
          </Link>
        </Reveal>

        <div className="grid gap-7 md:grid-cols-2">
          {proyectos.slice(0, 2).map((p, i) => (
            <ProjectCard key={p.id} proyecto={p} index={i} />
          ))}
        </div>
      </section>

      <ComoFunciona />

      
      <section className="border-t border-outline-variant bg-gradient-to-br from-surface-mid to-surface-low py-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 lg:px-10">
          <div>
            <h2 className="font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              {t('cta.titulo')}
              <br />
              {t('cta.subtitulo')}
            </h2>
            <p className="mt-3 max-w-md font-hanken text-base text-on-surface-variant">
              {t('cta.texto')}
            </p>
          </div>
          <Link
            href="/publicar"
            className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-hanken text-sm font-semibold text-on-primary"
          >
            {t('cta.boton')}
          </Link>
        </div>
      </section>
    </>
  )
}