'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

// next-themes: guarda la preferencia, la aplica antes del primer render (sin parpadeo)
// y mantiene la misma clave de localStorage que ya usábamos.
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      themes={['dark', 'light']}
      enableSystem={false}
      storageKey="zenplus_tema"
    >
      {children}
    </NextThemesProvider>
  )
}
