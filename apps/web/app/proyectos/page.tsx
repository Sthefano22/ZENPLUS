import { getProjects } from '@/lib/api'
import ProjectCard from '@/components/ui/ProjectCard'

export default async function ProyectosPage() {
  const proyectos = await getProjects()

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-primary">
        Desarrollos inmobiliarios
      </p>
      <h1 className="mt-2 font-syne text-3xl font-bold text-on-surface lg:text-4xl">Proyectos ZENPLUS</h1>
      <p className="mt-3 max-w-xl font-hanken text-base text-on-surface-variant">
        Nuevos desarrollos residenciales en las zonas de mayor plusvalía de Lima, desde preventa
        hasta entrega.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {proyectos.map((p, i) => (
          <ProjectCard key={p.id} proyecto={p} index={i} />
        ))}
      </div>
    </div>
  )
}
