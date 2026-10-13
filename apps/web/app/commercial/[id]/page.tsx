import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getOpportunityById } from '@/lib/api-commercial'
import OpportunityBadge from '@/components/commercial/OpportunityBadge'
import OpportunityTabs from '@/components/commercial/OpportunityTabs'

export const metadata: Metadata = {
  title: 'Opportunity | ZENPLUS Workspace',
}

function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

export default async function OpportunityDetallePage({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunityById(params.id)
  if (!opportunity) notFound()

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <Link href="/commercial" className="font-hanken text-xs text-on-surface-variant hover:text-primary">
        ← Volver a Opportunities
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-syne text-2xl font-bold text-on-surface">{opportunity.codigo}</p>
          <p className="mt-1 font-hanken text-base text-on-surface-variant">{opportunity.clienteNombre}</p>
          <p className="mt-0.5 font-hanken text-sm text-on-surface-variant">{opportunity.clienteEmail}</p>
        </div>
        <OpportunityBadge estado={opportunity.estado} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-outline-variant bg-surface-low p-6 sm:grid-cols-4">
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Asesor</p>
          <p className="mt-1 font-hanken text-sm font-semibold text-on-surface">{opportunity.asesorNombre}</p>
        </div>
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Creada</p>
          <p className="mt-1 font-hanken text-sm font-semibold text-on-surface">{formatearFecha(opportunity.creadoEn)}</p>
        </div>
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Actualizada</p>
          <p className="mt-1 font-hanken text-sm font-semibold text-on-surface">
            {formatearFecha(opportunity.actualizadoEn)}
          </p>
        </div>
        <div>
          <p className="font-hanken text-xs text-on-surface-variant">Teléfono</p>
          <p className="mt-1 font-hanken text-sm font-semibold text-on-surface">
            {opportunity.clienteTelefono ?? '—'}
          </p>
        </div>
      </div>

      <OpportunityTabs opportunityId={opportunity.id} />
    </div>
  )
}