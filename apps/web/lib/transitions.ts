import type { EstadoVisita, EstadoOferta } from '@/types'

/**
 * Tabla de transiciones de estado para Visitas comerciales (GAM2-004)
 * Gobierna las acciones permitidas tanto en cliente como en servidor.
 */
export const TRANSICIONES_VISITA: Record<EstadoVisita, EstadoVisita[]> = {
  Programada: ['Confirmada', 'Reprogramada', 'Cancelada', 'Realizada', 'No Show'],
  Confirmada: ['Realizada', 'No Show', 'Reprogramada', 'Cancelada'],
  Reprogramada: ['Confirmada', 'Realizada', 'No Show', 'Cancelada'],
  'No Show': ['Reprogramada', 'Cancelada'],
  Realizada: [], // Estado terminal de ejecución de la visita
  Cancelada: [], // Estado terminal
}

export function puedeTransicionarVisita(desde: EstadoVisita, hacia: EstadoVisita): boolean {
  return TRANSICIONES_VISITA[desde]?.includes(hacia) ?? false
}

/**
 * Tabla de transiciones de estado para Ofertas (GAM2-006)
 * Inmutabilidad: Las versiones anteriores no se editan ni eliminan, solo se crean nuevas.
 */
export const TRANSICIONES_OFERTA: Record<EstadoOferta, EstadoOferta[]> = {
  Borrador: ['Enviada', 'Rechazada'],
  Enviada: ['Contraoferta', 'Aceptada', 'Rechazada', 'Expirada'],
  'En Negociación': ['Contraoferta', 'Aceptada', 'Rechazada', 'Expirada'],
  Contraoferta: ['Contraoferta', 'Aceptada', 'Rechazada', 'Expirada'],
  Aceptada: [], // Estado terminal exitoso -> habilita Reserva
  Rechazada: [], // Estado terminal
  Expirada: ['Borrador'], // Permite reactivar con nueva propuesta
}

export function puedeTransicionarOferta(desde: EstadoOferta, hacia: EstadoOferta): boolean {
  return TRANSICIONES_OFERTA[desde]?.includes(hacia) ?? false
}
