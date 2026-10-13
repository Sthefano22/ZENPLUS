


export const CHAT_MODO_DEMO = process.env.NEXT_PUBLIC_CHAT_DEMO !== 'false'

export const CHAT_MAX_CARACTERES = 1000
export const CHAT_MAX_MENSAJES_HISTORIAL = 20


export const CHAT_NOMBRE_ASISTENTE = 'Xenia'

export const CHAT_SALUDO_ID = 'saludo'
export const CHAT_SALUDO =
  `¡Hola! Soy ${CHAT_NOMBRE_ASISTENTE}, tu asistente virtual de ZENPLUS. Puedo ayudarte a encontrar propiedades, resolver dudas sobre compra, alquiler o inversión y conectarte con un asesor. ¿En qué te ayudo?`

export const CHAT_SUGERENCIAS = [
  'Busco un departamento en Miraflores',
  'Quiero alquilar una oficina',
  '¿Cómo publico mi propiedad?',
  'Hablar con un asesor',
]

export function crearId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}