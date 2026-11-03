import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const LOCALES_VALIDOS = ['es', 'en', 'pt', 'fr', 'de']

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locale || !LOCALES_VALIDOS.includes(locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})