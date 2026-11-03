import { Briefcase, Building2, Gem, House } from 'lucide-react'

// Mismos valores que ya usaba el buscador del hero
export const DISTRITOS = ['San Isidro', 'Miraflores', 'La Molina', 'Barranco', 'Santiago de Surco']

export const TIPOS = [
  { key: 'departamentos', tipo: 'departamento', icon: Building2 },
  { key: 'casas', tipo: 'casa', icon: House },
  { key: 'penthouses', tipo: 'penthouse', icon: Gem },
  { key: 'oficinas', tipo: 'oficina', icon: Briefcase },
] as const

// Mismas cifras de la franja de estadísticas original (+18 Años, $380M+, 100%, 14.8%)
export const STATS = [
  { key: 'liderazgo', prefix: '+', to: 18, suffix: ' Años', decimals: 0 },
  { key: 'portafolio', prefix: '$', to: 380, suffix: 'M+', decimals: 0 },
  { key: 'titulacion', prefix: '', to: 100, suffix: '%', decimals: 0 },
  { key: 'roi', prefix: '', to: 14.8, suffix: '%', decimals: 1 },
] as const
