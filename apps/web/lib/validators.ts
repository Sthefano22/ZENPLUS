export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function esTelefonoPeruValido(telefono: string): boolean {
  const limpio = telefono.replace(/\s|-/g, '')
  return /^(\+?51)?9\d{8}$/.test(limpio)
}

export function esRequerido(valor: string | undefined | null): boolean {
  return Boolean(valor && valor.trim().length > 0)
}

export interface ResultadoValidacion {
  valido: boolean
  errores: Record<string, string>
}

export function validarFormularioConsulta(data: {
  nombre: string
  email: string
  telefono?: string
  mensaje: string
}): ResultadoValidacion {
  const errores: Record<string, string> = {}

  if (!esRequerido(data.nombre)) errores.nombre = 'Ingresa tu nombre completo.'
  if (!esRequerido(data.email) || !esEmailValido(data.email))
    errores.email = 'Ingresa un correo electrónico válido.'
  if (data.telefono && data.telefono.trim() && !esTelefonoPeruValido(data.telefono))
    errores.telefono = 'Ingresa un celular peruano válido (+51 9XXXXXXXX).'
  if (!esRequerido(data.mensaje)) errores.mensaje = 'Cuéntanos brevemente qué buscas.'

  return { valido: Object.keys(errores).length === 0, errores }
}
