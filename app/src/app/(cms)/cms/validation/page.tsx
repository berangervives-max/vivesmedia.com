'use client'
import { useState, useEffect } from 'react'
import { proposalsService } from '@/services/supabase.service'
import type { Proposal, ProposalType } from '@/types'
import Kpis from '@/components/cms/Kpis'
import VoiceInput from '@/components/cms/VoiceInput'
import { Check, X, Pencil, Clock, CheckCircle2, XCircle, ExternalLink, Search, Sparkles, Send } from 'lucide-react'

const TYPE_LABEL: Record<ProposalType, string> = {
  post_social: 'Post réseaux', email: 'Email', campagne: 'Campagne', visuel: 'Visuel', veille: 'Veille / MAJ', autre: 'Action',
}
const TYPE_COLOR: Record<ProposalType, string> = {
  post_social: '#C13584', email: 'var(--cms-info-fg)', campagne: '#7C56C7', visuel: 'var(--cms-brand)', veille: 'var(--cms-ok-fg)', autre: 'var(--cms-ink-2)',
}

export default function CmsValidationPage() {
  const [items, setItems] = useState<Proposal[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [modifFor, setModifFor] = useState<string | null>(null)
  const [modifText, setModifText] = useState('')

  const load = () => proposalsService.getAll().then(setItems).catch(e => setErr(/proposals/.test(e.message || '') ? 'table_absente' : e.message))
  useEffect(() => { load() }, [])

  const act = async (id: string, statut: 'valide' | 'refuse') => {
    setBusy(id)
    try { await proposalsService.update(id, { statut }); await load() } finally { setBusy(null) }
  }
  const saveModif = async (id: string) => {
    if (!modifText.trim()) { setModifFor(null); return }
    setBusy(id)
    try { await proposalsService.update(id, { modif_demandee: modifText.trim() }); setModifFor(null); setModifText(''); await load() }
    finally { setBusy(null) }
  }

  if (err === 'table_absente') return (
    <div className="rounded-xl p-8 max-w-2xl" style={{ background: 'var(--cms-warn-bg)', border: '1px solid var(--cms-warn-bg)' }}>
      <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--cms-warn-fg)' }}>Cockpit « À valider » — 1 étape à faire</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--cms-warn-fg)' }}>La table <code>proposals</code> n&apos;existe pas encore. Ouvre <b>Supabase → SQL Editor</b>, colle le contenu de <code>supabase/proposals.sql</code>, clique <b>Run</b>, puis recharge.</p>
    </div>
  )

  const pending = items.filter(p => p.statut === 'a_valider')
  const traites = items.filter(p => p.statut !== 'a_valider').slice(0, 12)

  return (
    <div>
      <div className="mb-5">
        <p className="cms-eyebrow">Cockpit</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>À valider</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--cms-muted)' }}>Chaque action proposée par les agents (posts, emails, campagnes, visuels, veille). Tu décides : valider, modifier (à la voix) ou refuser. Rien ne part sans ton accord.</p>
      </div>

      <Kpis items={[
        { label: 'À valider', value: pending.length, icon: Clock, color: 'var(--cms-warn-fg)' },
        { label: 'Validés', value: items.filter(p => p.statut === 'valide').length, icon: CheckCircle2, color: 'var(--cms-ok-fg)' },
        { label: 'Refusés', value: items.filter(p => p.statut === 'refuse').length, icon: XCircle, color: 'var(--cms-muted)' },
      ]} />

      {pending.length === 0 && (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', color: 'var(--cms-muted)' }}>
          Rien à valider pour l&apos;instant. Les agents y déposeront leurs propositions (posts du lundi, emails, nouveautés de la veille…).
        </div>
      )}

      <div className="space-y-4">
        {pending.map(p => (
          <div key={p.id} className="rounded-xl p-5" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded text-white" style={{ background: TYPE_COLOR[p.type] }}>{TYPE_LABEL[p.type]}</span>
                <h2 className="text-base font-bold" style={{ color: 'var(--cms-ink)' }}>{p.titre || '(sans titre)'}</h2>
              </div>
              {p.source ? <span className="text-[11px] shrink-0" style={{ color: 'var(--cms-muted)' }}>par {p.source}</span> : null}
            </div>

            {p.visuel_url ? <img src={p.visuel_url} alt="" className="rounded-lg max-h-52 object-cover mb-3" /> : null}

            {p.recherche ? <Section icon={Search} color="var(--cms-info-fg)" title="Recherche & compris">{p.recherche}</Section> : null}
            {p.contenu ? <Section icon={Send} color="var(--cms-ink)" title="Contenu proposé"><span className="whitespace-pre-wrap">{p.contenu}</span></Section> : null}
            {p.ton ? <Section icon={Sparkles} color="#7C56C7" title="Ton choisi & pourquoi">{p.ton}</Section> : null}
            {p.retombees ? <Section icon={CheckCircle2} color="var(--cms-ok-fg)" title="Retombées estimées (sourcées)">{p.retombees}</Section> : null}

            {p.modif_demandee ? (
              <p className="text-xs rounded-lg p-2.5 mb-3" style={{ background: 'var(--cms-warn-bg)', color: 'var(--cms-warn-fg)' }}>Modif demandée : {p.modif_demandee}</p>
            ) : null}

            {modifFor === p.id && (
              <div className="mb-3 rounded-lg p-3" style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--cms-ink-2)' }}>Dicte ou écris la modification</span>
                  <VoiceInput onResult={setModifText} label="Dicter" />
                </div>
                <textarea value={modifText} onChange={e => setModifText(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid var(--cms-border-2)' }} placeholder="Ex : raccourcis la légende et mets l'accent sur le prix…" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => saveModif(p.id)} disabled={busy === p.id} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: 'var(--cms-brand)' }}>Enregistrer la modif</button>
                  <button onClick={() => { setModifFor(null); setModifText('') }} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>Annuler</button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--cms-surface-2)' }}>
              <button onClick={() => act(p.id, 'valide')} disabled={busy === p.id} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50" style={{ background: 'var(--cms-ok-fg)' }}>
                <Check className="w-4 h-4" /> Valider
              </button>
              <button onClick={() => { setModifFor(p.id); setModifText(p.modif_demandee || '') }} className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
                <Pencil className="w-4 h-4" /> Modifier
              </button>
              <button onClick={() => act(p.id, 'refuse')} disabled={busy === p.id} className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50" style={{ border: '1px solid var(--cms-danger-bg)', color: 'var(--cms-danger-fg)' }}>
                <X className="w-4 h-4" /> Refuser
              </button>
              {p.cible_url ? <a href={p.cible_url} className="flex items-center gap-1 text-xs ml-auto hover:underline" style={{ color: 'var(--cms-info-fg)' }}>Ouvrir l&apos;onglet <ExternalLink className="w-3 h-3" /></a> : null}
            </div>
          </div>
        ))}
      </div>

      {traites.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--cms-muted)' }}>Traités récemment</h3>
          <div className="divide-y rounded-xl" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', borderColor: 'var(--cms-surface-2)' }}>
            {traites.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                {p.statut === 'valide' ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-ok-fg)' }} /> : <XCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-muted)' }} />}
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--cms-ink)' }}>{p.titre}</span>
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--cms-surface-2)', color: 'var(--cms-muted)' }}>{TYPE_LABEL[p.type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon: Icon, color, title, children }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color }}>
        <Icon className="w-3 h-3" /> {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--cms-ink-2)' }}>{children}</p>
    </div>
  )
}
