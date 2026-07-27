import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { PHASE_LABELS, type ProjectPhase } from '@/types/hub'
import { ChevronRight } from 'lucide-react'

// Liste des projets clients, native dans le /cms (fin du saut vers /hub/admin).
// Le détail ouvre encore l'ancien admin (proxifié, fonctionnel) le temps de le rapatrier.
export default async function CmsProjetsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name, email)')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="mb-5">
        <p className="cms-eyebrow">Suivi</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Projets <span className="cms-accent">clients</span></h1>
        <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>{projects?.length ?? 0} projet(s) au total</p>
      </div>

      {!projects?.length ? (
        <div className="rounded-2xl p-12 text-center text-sm" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', color: 'var(--cms-muted)' }}>
          Aucun projet. Crée d&apos;abord un client dans <Link href="/cms/clients" className="font-semibold" style={{ color: 'var(--cms-brand)' }}>Clients</Link>.
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => {
            const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
            const phase = project.current_phase as ProjectPhase
            return (
              <Link key={project.id} href={`/cms/projets/${project.id}`}
                className="rounded-2xl p-5 flex items-center justify-between transition-shadow hover:shadow-md group"
                style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold" style={{ background: 'var(--cms-brand)' }}>
                    {client?.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--cms-ink)' }}>{project.name}</p>
                    <p className="text-sm truncate" style={{ color: 'var(--cms-muted)' }}>
                      <span className="cms-accent" style={{ color: 'var(--cms-ink-2)' }}>{client?.name}</span>{client?.email ? ` · ${client.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="phase-badge" data-phase={phase}>{PHASE_LABELS[phase]}</span>
                  <p className="text-xs hidden sm:block" style={{ color: 'var(--cms-faint)' }}>{new Date(project.updated_at).toLocaleDateString('fr-FR')}</p>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--cms-faint)' }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
