import { describe, it, expect } from 'vitest'
import {
  esEmailValido,
  esTelefonoPeruValido,
  esRequerido,
  validarFormularioConsulta,
  validarRegistro,
} from '@/lib/validators'

describe('esEmailValido', () => {
  it('acepta correos válidos', () => {
    expect(esEmailValido('juan.perez@zenplus.pe')).toBe(true)
    expect(esEmailValido('a@b.co')).toBe(true)
  })

  it('rechaza correos inválidos', () => {
    expect(esEmailValido('no-es-email')).toBe(false)
    expect(esEmailValido('falta-arroba.com')).toBe(false)
    expect(esEmailValido('@sin-usuario.com')).toBe(false)
    expect(esEmailValido('sin-dominio@')).toBe(false)
    expect(esEmailValido('')).toBe(false)
  })

  it('recorta espacios antes de validar', () => {
    expect(esEmailValido('  juan.perez@zenplus.pe  ')).toBe(true)
    expect(esEmailValido('   ')).toBe(false)
  })
})

describe('esTelefonoPeruValido', () => {
  it('acepta formato con prefijo +51', () => {
    expect(esTelefonoPeruValido('+51987654321')).toBe(true)
  })

  it('acepta formato sin prefijo', () => {
    expect(esTelefonoPeruValido('987654321')).toBe(true)
  })

  it('acepta el número con espacios o guiones', () => {
    expect(esTelefonoPeruValido('+51 987 654 321')).toBe(true)
    expect(esTelefonoPeruValido('987-654-321')).toBe(true)
  })

  it('rechaza números inválidos', () => {
    expect(esTelefonoPeruValido('123456789')).toBe(false) // no empieza en 9
    expect(esTelefonoPeruValido('98765432')).toBe(false) // muy corto
    expect(esTelefonoPeruValido('abcdefghi')).toBe(false)
    expect(esTelefonoPeruValido('')).toBe(false)
  })
})

describe('esRequerido', () => {
  it('rechaza string vacío', () => {
    expect(esRequerido('')).toBe(false)
  })

  it('rechaza null y undefined', () => {
    expect(esRequerido(null)).toBe(false)
    expect(esRequerido(undefined)).toBe(false)
  })

  it('rechaza strings de solo espacios', () => {
    expect(esRequerido('   ')).toBe(false)
  })

  it('acepta un valor con contenido', () => {
    expect(esRequerido('Juan Pérez')).toBe(true)
    expect(esRequerido('  Juan  ')).toBe(true)
  })
})

describe('validarFormularioConsulta', () => {
  const base = {
    nombre: 'Juan Pérez',
    email: 'juan.perez@zenplus.pe',
    telefono: '+51 987 654 321',
    mensaje: 'Busco un departamento en Miraflores.',
  }

  it('es válido con todos los campos correctos', () => {
    const resultado = validarFormularioConsulta(base)
    expect(resultado.valido).toBe(true)
    expect(resultado.errores).toEqual({})
  })

  it('marca error cuando faltan campos requeridos', () => {
    const resultado = validarFormularioConsulta({ nombre: '', email: '', telefono: '', mensaje: '' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.nombre).toBeDefined()
    expect(resultado.errores.email).toBeDefined()
    expect(resultado.errores.mensaje).toBeDefined()
  })

  it('marca error si el teléfono es inválido', () => {
    const resultado = validarFormularioConsulta({ ...base, telefono: '123' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.telefono).toBeDefined()
  })

  it('el teléfono es opcional cuando está vacío', () => {
    const resultado = validarFormularioConsulta({ ...base, telefono: '' })
    expect(resultado.errores.telefono).toBeUndefined()
  })
})

describe('validarRegistro', () => {
  const base = {
    nombre: 'Fiorella Mendoza',
    email: 'fiorella@zenplus.pe',
    telefono: '+51 912 345 678',
    password: 'contraseña123',
    confirmarPassword: 'contraseña123',
    aceptaTerminos: true,
  }

  it('es válido con todos los datos correctos', () => {
    const resultado = validarRegistro(base)
    expect(resultado.valido).toBe(true)
    expect(resultado.errores).toEqual({})
  })

  it('marca error cuando las contraseñas no coinciden', () => {
    const resultado = validarRegistro({ ...base, confirmarPassword: 'otra-clave' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.confirmarPassword).toBeDefined()
  })

  it('marca error cuando la contraseña es muy corta', () => {
    const resultado = validarRegistro({ ...base, password: '123', confirmarPassword: '123' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.password).toBeDefined()
  })

  it('marca error cuando el email es inválido', () => {
    const resultado = validarRegistro({ ...base, email: 'no-es-email' })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.email).toBeDefined()
  })

  it('marca error cuando no se aceptan los términos', () => {
    const resultado = validarRegistro({ ...base, aceptaTerminos: false })
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.terminos).toBeDefined()
  })
})
