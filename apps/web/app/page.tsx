import Link from 'next/link'
import HeroSearch from '@/components/layout/HeroSearch'
import PropertyCard from '@/components/ui/PropertyCard'
import ProjectCard from '@/components/ui/ProjectCard'
import { getFeaturedProperties, getProjects } from '@/lib/api'

const STATS = [
  { valor: '+18 Años', label: 'Liderazgo en el mercado' },
  { valor: '$380M+', label: 'USD en portafolio' },
  { valor: '100%', label: 'Titulación garantizada' },
  { valor: '14.8%', label: 'ROI anual promedio' },
]

const RAZONES = [
  {
    titulo: 'Curaduría exclusiva',
    texto: 'Cada propiedad pasa por un proceso de selección riguroso antes de publicarse.',
  },
  {
    titulo: 'Asesoría de principio a fin',
    texto: 'Un asesor dedicado te acompaña desde la primera visita hasta la firma.',
  },
  {
    titulo: 'Data del mercado en tiempo real',
    texto: 'Precios, tendencias y comparables por distrito para decidir con información.',
  },
]

export default async function Home() {
  const [destacadas, proyectos] = await Promise.all([getFeaturedProperties(), getProjects()])

  return (
    <>
      <HeroSearch />

      
      <section className="border-y border-outline-variant bg-surface-low py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 text-center lg:grid-cols-4 lg:px-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-syne text-3xl font-bold text-primary">{s.valor}</p>
              <p className="mt-1 font-hanken text-sm text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
              Selección ZENPLUS
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              Propiedades Destacadas
            </h2>
          </div>
          <Link href="/buscar" className="font-hanken text-sm font-semibold text-primary">
            Ver todas →
          </Link>
        </div>

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
              Por qué ZENPLUS
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              La forma más segura de invertir en Lima
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {RAZONES.map((r, i) => (
              <div key={r.titulo} className="rounded-xl border border-outline-variant bg-surface-mid p-8">
                <span className="font-syne text-3xl font-bold text-primary-container">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 font-syne text-lg font-semibold text-on-surface">{r.titulo}</h3>
                <p className="mt-2 font-hanken text-sm text-on-surface-variant">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
              Nuevos desarrollos
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              Proyectos en preventa y construcción
            </h2>
          </div>
          <Link href="/proyectos" className="font-hanken text-sm font-semibold text-primary">
            Ver proyectos →
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {proyectos.slice(0, 2).map((p, i) => (
            <ProjectCard key={p.id} proyecto={p} index={i} />
          ))}
        </div>
      </section>

      
      <section className="border-t border-outline-variant bg-gradient-to-br from-surface-mid to-surface-low py-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 lg:px-10">
          <div>
            <h2 className="font-syne text-3xl font-bold text-on-surface lg:text-4xl">
              ¿Tienes una propiedad?
              <br />
              Publícala con ZENPLUS
            </h2>
            <p className="mt-3 max-w-md font-hanken text-base text-on-surface-variant">
              Accede a nuestra red de compradores e inversionistas calificados en todo el Perú.
            </p>
          </div>
          <Link
            href="/publicar"
            className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-hanken text-sm font-semibold text-on-primary"
          >
            Publicar mi propiedad
          </Link>
        </div>
      </section>
    </>
  )
}
