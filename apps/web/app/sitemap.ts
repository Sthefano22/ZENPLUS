import type { MetadataRoute } from 'next'
import { getProperties, getProjects } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://zenplus.pe'

  const rutas = [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/buscar`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/proyectos`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/publicar`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/xenia`, lastModified: new Date(), priority: 0.6 },
  ]

  const [propiedades, proyectos] = await Promise.all([getProperties(), getProjects()])

  const rutasPropiedades = propiedades.map((p) => ({
    url: `${base}/propiedad/${p.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }))

  const rutasProyectos = proyectos.map((p) => ({
    url: `${base}/proyectos/${p.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }))

  return [...rutas, ...rutasPropiedades, ...rutasProyectos]
}