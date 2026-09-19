import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPropertyBySlug } from '@/lib/api'
import Badge from '@/components/ui/Badge'
import LeadForm from '@/components/forms/LeadForm'

export default async function PropiedadPage({ params }: { params: { slug: string } }) {
  const propiedad = await getPropertyBySlug(params.slug)
  if (!propiedad) notFound()

  const precioFormateado = new Intl.NumberFormat('en-US').format(propiedad.precio)
  const precioTexto =
    propiedad.operacion === 'alquiler' ? `USD $${precioFormateado} / mes` : `USD $${precioFormateado}`

  return (
    <div className="pb-24">
      <div className="relative mx-auto aspect-[16/7] max-w-7xl px-6 pt-6 lg:px-10">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image src={propiedad.imagen} alt={propiedad.titulo} fill sizes="100vw" className="object-cover" priority />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 pt-12 lg:grid-cols-[1.7fr_1fr] lg:px-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Badge estado={propiedad.estado} />
            <span className="font-hanken text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              {propiedad.operacion === 'venta' ? 'Venta' : 'Alquiler'}
            </span>
          </div>

          <h1 className="font-syne text-3xl font-bold text-on-surface lg:text-4xl">{propiedad.titulo}</h1>
          <p className="mt-3 font-hanken text-lg text-on-surface-variant">{propiedad.subtitulo}</p>
          <p className="mt-2 font-hanken text-sm text-primary-container">{propiedad.ubicacion}</p>

          <div className="mt-8 grid grid-cols-4 gap-4 rounded-xl border border-outline-variant bg-surface-low p-6">
            {[
              [`${propiedad.areaM2} m²`, 'Área total'],
              [propiedad.dormitorios, 'Dormitorios'],
              [propiedad.banos, 'Baños'],
              [propiedad.estacionamientos, 'Estacionamientos'],
            ].map(([valor, label]) => (
              <div key={label as string}>
                <p className="font-syne text-lg font-semibold text-on-surface">{valor}</p>
                <p className="mt-1 font-hanken text-xs text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="font-syne text-xl font-semibold text-on-surface">Descripción</h2>
            <p className="mt-3 font-hanken text-base leading-relaxed text-on-surface-variant">
              {propiedad.descripcion}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-syne text-xl font-semibold text-on-surface">Características</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {propiedad.caracteristicas.map((c) => (
                <li key={c} className="relative pl-5 font-hanken text-sm text-on-surface-variant">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="rounded-xl border border-outline-variant bg-surface-low p-7">
            <p className="font-hanken text-xs text-on-surface-variant">Precio</p>
            <p className="mt-1 font-syne text-2xl font-bold text-primary">{precioTexto}</p>
            <div className="mt-6">
              <LeadForm propiedadRef={propiedad.slug} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
