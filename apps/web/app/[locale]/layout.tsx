import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import SiteChrome from '@/components/layout/SiteChrome'
import ChatWidget from '@/components/chat/ChatWidget'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import ThemeProvider from '@/components/layout/ThemeProvider'

const LOCALES_VALIDOS = ['es', 'en', 'pt', 'fr', 'de']

export const metadata: Metadata = {
  title: {
    default: 'ZENPLUS.pe | Bienes Raíces de Lujo en Perú',
    template: '%s | ZENPLUS',
  },
  description:
    'Departamentos, casas y oficinas exclusivas en San Isidro, Miraflores, La Molina y Barranco. La plataforma inmobiliaria de lujo líder en el Perú.',
  metadataBase: new URL('https://zenplus.pe'),
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!LOCALES_VALIDOS.includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-surface font-hanken text-on-surface antialiased">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:font-hanken focus:text-sm focus:font-semibold focus:text-on-primary"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SiteChrome>{children}</SiteChrome>
            <ChatWidget />
            <GoogleAnalytics />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}