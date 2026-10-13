import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/registro', '/perfil', '/admin'],
    },
    sitemap: 'https://zenplus.pe/sitemap.xml',
  }
}