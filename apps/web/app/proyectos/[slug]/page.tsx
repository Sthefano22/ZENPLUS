import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getProjectBySlug, getUnitsByProject } from '@/lib/api'
import type { EstadoUnidad } from '@/types'

const ESTILO_ESTADO: Record<EstadoUnidad, string> = {
  Disponible: 'bg-primary/15 text-primary border border-primary/30',
  Reservada: 'bg-secondary/15 text-secondary border border-outline-variant',
  Vendida: 'bg-white/5 text-on-surface-variant border border-outline-variant',
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const proyecto = await getProjectBySlug(params.slug)
  if (!proyecto) return { title: 'Proyecto no encontrado | ZENPLUS' }

  const titulo = `${proyecto.nombre} — ${proyecto.distrito} | ZENPLUS`
  const descripcion = `${proyecto.descripcion} Desde USD $${new Intl.NumberFormat('en-US').format(proyecto.precioDesde)}.`

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      images: [{ url: proyecto.imagen }],
    },
  }
}

export default async function ProyectoDetallePage({ params }: { params: { slug: string } }) {
  const proyecto = await getProjectBySlug(params.slug)
  if (!proyecto) notFound()

  const unidades = await getUnitsByProject(params.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: proyecto.nombre,
    description: proyecto.descripcion,
    image: proyecto.imagen,
    address: {
      '@type': 'PostalAddress',
      addressLocality: proyecto.distrito,
      addressCountry: 'PE',
    },
    numberOfAccommodationUnits: proyecto.unidades,
  }

  return (
    <div className="pb-24">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative mx-auto aspect-[16/6] max-w-7xl px-6 pt-6 lg:px-10">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image src={proyecto.imagen} alt={proyecto.nombre} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <span className="rounded-full bg-primary px-3 py-1.5 font-hanken text-[11px] font-semibold uppercase tracking-wider text-on-primary">
          {proyecto.estado}
        </span>
        <h1 className="mt-4 font-syne text-3xl font-bold text-on-surface lg:text-4xl">{proyecto.nombre}</h1>
        <p className="mt-2 font-hanken text-base text-on-surface-variant">
          {proyecto.distrito} · {proyecto.niveles} niveles · {proyecto.certificacion}
        </p>
        <p className="mt-4 max-w-2xl font-hanken text-base text-on-surface-variant">{proyecto.descripcion}</p>
        <p className="mt-4 font-hanken text-sm text-on-surface-variant">
          Precio desde{' '}
          <span className="font-syne text-lg font-semibold text-primary">
            USD ${new Intl.NumberFormat('en-US').format(proyecto.precioDesde)}
          </span>
        </p>

        {/* Units públicos */}
        <section className="mt-12">
          <h2 className="font-syne text-2xl font-semibold text-on-surface">
            Unidades disponibles ({unidades.filter((u) => u.estado === 'Disponible').length} de {unidades.length})
          </h2>

          <div className="mt-6 overflow-hidden rounded-xl border border-outline-variant">
            <table className="w-full text-left font-hanken text-sm">
              <thead className="bg-surface-low text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Unidad</th>
                  <th scope="col" className="px-5 py-3 font-medium">Tipo</th>
                  <th scope="col" className="px-5 py-3 font-medium">Torre / Piso</th>
                  <th scope="col" className="px-5 py-3 font-medium">Área</th>
                  <th scope="col" className="px-5 py-3 font-medium">Dorm. / Baños</th>
                  <th scope="col" className="px-5 py-3 font-medium">Precio</th>
                  <th scope="col" className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-mid">
                {unidades.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-4 font-semibold text-on-surface">{u.codigo}</td>
                    <td className="px-5 py-4 capitalize text-on-surface-variant">{u.tipo}</td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {u.torre !== '—' ? `Torre ${u.torre} · Piso ${u.piso}` : 'Lote'}
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{u.areaM2} m²</td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {u.dormitorios > 0 ? `${u.dormitorios} / ${u.banos}` : '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      USD ${new Intl.NumberFormat('en-US').format(u.precio)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${ESTILO_ESTADO[u.estado]}`}
                      >
                        {u.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unidades.length === 0 && (
            <p className="mt-6 font-hanken text-sm text-on-surface-variant">
              Unidades disponibles próximamente
            </p>
          )}
        </section>
      </div>
    </div>
  )
}