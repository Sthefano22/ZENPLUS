'use client'

import { Link } from '@/i18n/navigation'

interface AccessStateProps {
  tipo: '401' | '403_404' | 'expirado' | 'archivo_no_disponible' | 'operacion_cerrada'
  mensajePersonalizado?: string
  retornarUrl?: string
}

export default function AccessState({
  tipo,
  mensajePersonalizado,
  retornarUrl = '/',
}: AccessStateProps) {
  let titulo = 'Acceso no disponible'
  let mensaje =
    'El recurso solicitado no se encuentra disponible o usted no cuenta con los permisos necesarios para visualizarlo.'
  let ctaLabel = 'Volver al Inicio'
  let ctaHref = retornarUrl

  switch (tipo) {
    case '401':
      titulo = 'Autenticación Requerida'
      mensaje = 'Debe iniciar sesión con una cuenta autorizada para acceder a este espacio.'
      ctaLabel = 'Iniciar Sesión'
      ctaHref = '/login'
      break

    case '403_404':
      // Regla de Oro GAM3-009: 403 y 404 muestran el mismo texto neutro para no revelar existencia de recursos ajenos
      titulo = 'Recurso No Disponible'
      mensaje =
        mensajePersonalizado ||
        'El recurso solicitado no se encuentra disponible o no tiene permisos para acceder.'
      break

    case 'expirado':
      titulo = 'Enlace Expirado'
      mensaje =
        'El enlace de acceso temporal ha vencido por políticas de seguridad. Por favor solicite un nuevo enlace de descarga.'
      ctaLabel = 'Volver a la Operación'
      break

    case 'archivo_no_disponible':
      titulo = 'Documento No Disponible'
      mensaje =
        'El documento solicitado está siendo procesado o se encuentra temporalmente fuera de línea.'
      break

    case 'operacion_cerrada':
      titulo = 'Operación Finalizada'
      mensaje =
        'Esta operación ha concluido su ciclo operativo y se encuentra archivada bajo custodia segura.'
      break
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant bg-surface-low text-2xl text-on-surface-variant">
        🔒
      </div>
      <h2 className="mt-5 font-syne text-2xl font-bold text-on-surface">{titulo}</h2>
      <p className="mt-2.5 max-w-md font-hanken text-sm text-on-surface-variant leading-relaxed">
        {mensaje}
      </p>
      <div className="mt-6">
        <Link
          href={ctaHref}
          className="rounded-full bg-primary px-6 py-2.5 font-hanken text-xs font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}
