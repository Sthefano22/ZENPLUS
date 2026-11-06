import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buscar Propiedades',
  description:
    'Filtra departamentos, casas, penthouses y oficinas en venta o alquiler por distrito, precio y dormitorios en Lima, Perú.',
}

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
