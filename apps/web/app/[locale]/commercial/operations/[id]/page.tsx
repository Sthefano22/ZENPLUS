import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { getOperationById, getOperationMilestones, getOperationTimeline } from '@/lib/api-transaction'
import TransactionMilestones from '@/components/transaction/TransactionMilestones'
import DocumentCenter from '@/components/transaction/DocumentCenter'
import ContractStatusPanel from '@/components/transaction/ContractStatusPanel'
import ObligationsPanel from '@/components/transaction/ObligationsPanel'
import CommercialTimeline from '@/components/commercial/CommercialTimeline'
import AccessState from '@/components/transaction/AccessState'

export const metadata: Metadata = {
  title: 'Operación Transaccional | ZENPLUS Workspace',
}

export default async function OperationDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const [opRes, msRes, tlRes] = await Promise.all([
    getOperationById(params.id),
    getOperationMilestones(params.id),
    getOperationTimeline(params.id),
  ])

  if (!opRes.ok) {
    if (opRes.status === 404 || opRes.status === 403) {
      return (
        <div className="mx-auto max-w-5xl px-6 py-12">
          <AccessState tipo="403_404" retornarUrl="/commercial" />
        </div>
      )
    }
    notFound()
  }

  const op = opRes.data
  const milestones = msRes.ok ? msRes.data : []
  const timeline = tlRes.ok ? tlRes.data : []

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <div className="flex items-center justify-between">
        <Link
          href={`/commercial/${op.opportunityId}`}
          className="font-hanken text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          ← Volver a la Oportunidad Comercial
        </Link>
        <span className="font-hanken text-xs text-on-surface-variant">
          Reserva ref: <strong className="text-on-surface">{op.reservaId}</strong>
        </span>
      </div>

      {/* Header Operación */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-syne text-2xl sm:text-3xl font-bold text-on-surface">
              {op.codigo}
            </h1>
            <span className="rounded-full bg-primary/20 px-3 py-0.5 font-hanken text-xs font-semibold text-primary">
              Etapa: {op.etapa}
            </span>
          </div>
          <p className="mt-1 font-syne text-lg font-semibold text-on-surface">
            {op.activo.titulo}
          </p>
          <p className="font-hanken text-xs text-on-surface-variant">
            {op.activo.distrito} · Precio de Cierre: USD ${op.activo.precioAcordado.toLocaleString('en-US')}
          </p>
        </div>

        <div className="text-right">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-hanken text-xs font-semibold text-emerald-400">
            {op.estado}
          </span>
        </div>
      </div>

      {/* Próxima Acción Transaccional */}
      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">
          ⚡
        </span>
        <div>
          <p className="font-hanken text-[11px] font-semibold uppercase tracking-wider text-primary">
            Próxima Acción Transaccional
          </p>
          <p className="font-hanken text-sm font-semibold text-on-surface">
            {op.proximaAccion}
          </p>
        </div>
      </div>

      {/* Ruta de Hitos */}
      <div className="mt-8">
        <TransactionMilestones etapaActual={op.etapa} milestones={milestones} />
      </div>

      {/* Resumen de Partes Vinculadas */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {op.partes.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-outline-variant bg-surface-low p-5"
          >
            <span className="font-hanken text-[10px] font-bold uppercase tracking-wider text-primary">
              Parte Vinculada ({p.rol})
            </span>
            <p className="mt-1 font-syne text-sm font-semibold text-on-surface">{p.nombre}</p>
            <p className="font-hanken text-xs text-on-surface-variant">{p.email}</p>
            {p.telefono && (
              <p className="mt-0.5 font-hanken text-xs text-on-surface-variant">{p.telefono}</p>
            )}
          </div>
        ))}
      </div>

      {/* Secciones Transaccionales: Documentos, Contrato, Finanzas y Timeline */}
      <div className="mt-10 space-y-10">
        <section>
          <DocumentCenter operationId={op.id} puedeSubir={true} />
        </section>

        <section>
          <ContractStatusPanel operationId={op.id} />
        </section>

        <section>
          <ObligationsPanel operationId={op.id} />
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-low p-6">
          <h3 className="mb-4 font-syne text-sm font-bold uppercase tracking-wider text-on-surface">
            Historial de Auditoría Transaccional
          </h3>
          <CommercialTimeline eventos={timeline} />
        </section>
      </div>
    </div>
  )
}
