import type { Metadata } from 'next'
import LeadForm from '@/components/forms/LeadForm'

export const metadata: Metadata = {
  title: 'Contacto | ZENPLUS',
  description: 'Comunícate con nuestro equipo de asesores inmobiliarios expertos en Lima.',
}

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <div className="text-center">
        <span className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
          Atención Personalizada
        </span>
        <h1 className="mt-3 font-syne text-3xl font-bold text-on-surface sm:text-4xl">
          Contáctate con un Asesor ZENPLUS
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-hanken text-base text-on-surface-variant">
          Déjanos tus datos y un asesor especializado en inmuebles de alta gama se pondrá en contacto contigo en menos de 24 horas.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-outline-variant bg-surface-low p-6 sm:p-10 shadow-sm">
        <LeadForm origen="web" />
      </div>
    </div>
  )
}
