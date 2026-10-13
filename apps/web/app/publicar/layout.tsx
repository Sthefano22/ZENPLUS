import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publica tu Propiedad',
  description:
    'Publica tu departamento, casa u oficina con ZENPLUS y accede a nuestra red de compradores e inversionistas calificados en todo el Perú.',
}

export default function PublicarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}