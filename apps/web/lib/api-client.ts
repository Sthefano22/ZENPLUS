export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      status: number
      code?: string
      fieldErrors?: Record<string, string>
      message: string
    }

/**
 * Mensajes seguros al usuario para evitar fuga de información sensible (Sec 8 / GAM3-009)
 */
export function getSafeErrorMessage(status: number, defaultMsg = 'Ocurrió un error inesperado.'): string {
  if (status === 401) return 'Sesión no válida o expirada. Por favor inicie sesión.'
  if (status === 403 || status === 404) return 'El recurso solicitado no está disponible o no tiene permisos para acceder.'
  if (status === 409) return 'Existe un conflicto de concurrencia con este recurso. Por favor actualice e intente nuevamente.'
  if (status === 422) return 'Los datos enviados no son válidos. Por favor revise los campos señalados.'
  if (status >= 500) return 'Error temporal en el servicio. Intente nuevamente en unos momentos.'
  return defaultMsg
}

/**
 * Cliente HTTP tipado para comunicación con Beta y Alpha.
 * Devuelve un resultado discriminado para manejo robusto de errores.
 */
export async function requestApi<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${baseUrl}${path}`, init)
    if (!res.ok) {
      let fieldErrors: Record<string, string> | undefined
      let code: string | undefined
      let message = getSafeErrorMessage(res.status)

      try {
        const errorBody = await res.json()
        if (errorBody && typeof errorBody === 'object') {
          if (errorBody.fieldErrors) fieldErrors = errorBody.fieldErrors
          if (errorBody.code) code = errorBody.code
          if (errorBody.message && res.status !== 403 && res.status !== 404) {
            message = errorBody.message
          }
        }
      } catch {
        // Ignorar fallo de parseo JSON en respuestas de error
      }

      return {
        ok: false,
        status: res.status,
        code,
        fieldErrors,
        message,
      }
    }

    const data = (await res.json()) as T
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'No fue posible conectar con el servidor. Verifique su conexión.',
    }
  }
}
