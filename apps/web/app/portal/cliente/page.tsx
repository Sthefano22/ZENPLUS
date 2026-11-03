import type { Metadata } from 'next'
import { getOperations, getOperationMilestones } from '@/lib/api-transaction'
import TransactionMilestones from '@/components/transaction/TransactionMilestones'
import DocumentCenter from '@/components/transaction/DocumentCenter'
import ObligationsPanel from '@/components/transaction/ObligationsPanel'
import AccessState from '@/components/transaction/AccessState'

export const metadata: Metadata = {
  title: 'Portal del Comprador | ZENPLUS',
  description: 'Seguimiento seguro del proceso de compra de tu propiedad.',
}

export default async function ClientPortalPage() {
  const opsRes = await getOperations()
  const operations = opsRes.ok ? opsRes.data : []
  const op = operations[0]

  if (!op) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <AccessState tipo="operacion_cerrada" mensajePersonalizado="No tienes operaciones de compra activas en este momento." />
      </div>
    )
  }

  const msRes = await getOperationMilestones(op.id)
  const milestones = msRes.ok ? msRes.data : []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Encabezado Mobile-First */}
      <div className="rounded-2xl border border-outline-variant bg-surface-low p-6 sm:p-8">
        <span className="font-hanken text-xs font-semibold uppercase tracking-wider text-primary">
          Portal del Comprador
        </span>
        <h1 className="mt-1 font-syne text-2xl sm:text-3xl font-bold text-on-surface">
          {op.activo.titulo}
        </h1>
        <p className="mt-1 font-hanken text-sm text-on-surface-variant">
          {op.activo.distrito} · Código de Operación: <strong className="text-on-surface">{op.codigo}</strong>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/60 pt-4">
          <div>
            <p className="font-hanken text-xs text-on-surface-variant">Etapa Actual</p>
            <p className="font-syne text-base font-bold text-primary">{op.etapa}</p>
          </div>
          <div className="max-w-md text-left sm:text-right">
            <p className="font-hanken text-xs text-on-surface-variant">Próximo Paso</p>
            <p className="font-hanken text-xs font-semibold text-on-surface">{op.proximaAccion}</p>
          </div>
        </div>
      </div>

      {/* Stepper de Hitos */}
      <div className="mt-8">
        <TransactionMilestones etapaActual={op.etapa} milestones={milestones} />
      </div>

      {/* Documentos del Comprador (Data Scope: comprador) */}
      <div className="mt-10">
        <DocumentCenter operationId={op.id} roleScope="comprador" puedeSubir={true} />
      </div>

      {/* Obligaciones Financieras del Comprador */}
      <div className="mt-10">
        <ObligationsPanel operationId={op.id} />
      </div>
    </div>
  )
}
