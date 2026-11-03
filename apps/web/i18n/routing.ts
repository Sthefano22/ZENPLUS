import { defineRouting } from 'next-intl/routing'

// Misma configuración que middleware.ts (prefijo de idioma siempre visible)
export const routing = defineRouting({
  locales: ['es', 'en', 'pt', 'fr', 'de'],
  defaultLocale: 'es',
})
