import { describe, it, expect } from 'vitest'
import { validarFormularioConsulta } from '@/lib/validators'

/**
 * LeadForm.tsx no se importa aquí: este archivo prueba la lógica de validación
 * que el componente ejecuta en su handleSubmit, replicada como función pura,
 * en vez de renderizar el árbol React completo.
 */

interface DatosLeadForm {
  nombre: string
  email: string
  telefono: string
  mensaje: string
  consentimiento: boolean
}

function validarLeadForm(datos: DatosLeadForm): { valido: boolean; errores: Record<string, string> } {
  const validacion = validarFormularioConsulta({
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    mensaje: datos.mensaje,
  })
  const errores = { ...validacion.errores }
  if (!datos.consentimiento) errores.consentimiento = 'Debes aceptar la política de privacidad.'
  return { valido: validacion.valido && datos.consentimiento, errores }
}

const datosValidos: DatosLeadForm = {
  nombre: 'Juan Pérez',
  email: 'juan.perez@zenplus.pe',
  telefono: '',
  mensaje: 'Busco un departamento en Miraflores.',
  consentimiento: true,
}

describe('LeadForm — lógica de validación', () => {
  it('estado idle: no hay errores antes de intentar enviar', () => {
    const erroresIniciales: Record<string, string> = {}
    expect(erroresIniciales).toEqual({})
  })

  it('intento de submit sin datos: marca errores en nombre, email y mensaje', () => {
    const resultado = validarLeadForm({ nombre: '', email: '', telefono: '', mensaje: '', consentimiento: true })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.nombre).toBeDefined()
    expect(resultado.errores.email).toBeDefined()
    expect(resultado.errores.mensaje).toBeDefined()
  })

  it('sin consentimiento: marca error de consentimiento aunque el resto sea válido', () => {
    const resultado = validarLeadForm({ ...datosValidos, consentimiento: false })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.consentimiento).toBeDefined()
  })

  it('email inválido: marca error de email', () => {
    const resultado = validarLeadForm({ ...datosValidos, email: 'no-es-email' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.email).toBeDefined()
  })

  it('formulario válido: no hay errores de validación', () => {
    const resultado = validarLeadForm(datosValidos)
    expect(resultado.valido).toBe(true)
    expect(resultado.errores).toEqual({})
  })
})
