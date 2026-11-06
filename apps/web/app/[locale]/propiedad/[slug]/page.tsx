import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPropertyBySlug } from '@/lib/api'
import Badge from '@/components/ui/Badge'
import LeadForm from '@/components/forms/LeadForm'

function esImagenUnsplash(url: string): boolean {
  try {
    return new URL(url).hostname === 'images.unsplash.com'
  } catch {
    return false
  }
}

function conAncho(url: string, ancho: number): string {
  const u = new URL(url)
  u.searchParams.set('w', String(ancho))
  return u.toString()
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const t = await getTranslations('propiedad')
  const propiedad = await getPropertyBySlug(params.slug)
  if (!propiedad) return { title: t('noEncontrada') }

  const titulo = `${propiedad.titulo} — ${propiedad.ubicacion}`
  const operacionTexto = propiedad.operacion === 'venta' ? t('enVenta') : t('enAlquiler')
  const descripcion = `${propiedad.subtitulo}. ${propiedad.areaM2}m², ${propiedad.dormitorios} ${t('dormitorios')}, ${propiedad.banos} ${t('banos')}. ${operacionTexto} — ${propiedad.distrito}.`

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      images: [{ url: propiedad.imagen }],
      type: 'website',
    },
  }
}

export default async function PropiedadPage({ params }: { params: { slug: string } }) {
  const t = await getTranslations('propiedad')
  const propiedad = await getPropertyBySlug(params.slug)
  if (!propiedad) notFound()

  const precioFormateado = new Intl.NumberFormat('en-US').format(propiedad.precio)
  const precioTexto =
    propiedad.operacion === 'alquiler'
      ? `USD $${precioFormateado} ${t('porMes')}`
      : `USD $${precioFormateado}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: propiedad.titulo,
    description: propiedad.descripcion,
    image: propiedad.imagen,
    offers: {
      '@type': 'Offer',
      priceCurrency: propiedad.moneda,
      price: propiedad.precio,
      availability: 'https://schema.org/InStock',
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: t('areaTotal'), value: `${propiedad.areaM2} m²` },
      { '@type': 'PropertyValue', name: t('dormitorios'), value: propiedad.dormitorios },
      { '@type': 'PropertyValue', name: t('banos'), value: propiedad.banos },
    ],
  }

  return (
    <div className="pb-24">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative mx-auto aspect-[16/7] max-w-7xl px-6 pt-6 lg:px-10">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image src={propiedad.imagen} alt={propiedad.titulo} fill sizes="100vw" className="object-cover" priority />
        </div>
      </div>

      {esImagenUnsplash(propiedad.imagen) && (
        <div className="mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-3 px-6 lg:px-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={conAncho(propiedad.imagen, 400)}
              alt={`${propiedad.titulo} - 1`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={conAncho(propiedad.imagen, 600)}
              alt={`${propiedad.titulo} - 2`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 pt-12 lg:grid-cols-[1.7fr_1fr] lg:px-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Badge estado={propiedad.estado} />
            <span className="font-hanken text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              {propiedad.operacion === 'venta' ? t('venta') : t('alquiler')}
            </span>
          </div>

          <h1 className="font-syne text-3xl font-bold text-on-surface lg:text-4xl">{propiedad.titulo}</h1>
          <p className="mt-3 font-hanken text-lg text-on-surface-variant">{propiedad.subtitulo}</p>
          <p className="mt-2 font-hanken text-sm text-primary-container">{propiedad.ubicacion}</p>

          <div className="mt-8 grid grid-cols-4 gap-4 rounded-xl border border-outline-variant bg-surface-low p-6">
            {[
              [`${propiedad.areaM2} m²`, t('areaTotal')],
              [propiedad.dormitorios, t('dormitorios')],
              [propiedad.banos, t('banos')],
              [propiedad.estacionamientos, t('estacionamientos')],
            ].map(([valor, label]) => (
              <div key={label as string}>
                <p className="font-syne text-lg font-semibold text-on-surface">{valor}</p>
                <p className="mt-1 font-hanken text-xs text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="font-syne text-xl font-semibold text-on-surface">{t('descripcion')}</h2>
            <p className="mt-3 font-hanken text-base leading-relaxed text-on-surface-variant">
              {propiedad.descripcion}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-syne text-xl font-semibold text-on-surface">{t('caracteristicas')}</h2>
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
            <p className="font-hanken text-xs text-on-surface-variant">{t('precio')}</p>
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