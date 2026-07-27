'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function NouveauClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', projectName: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.projectName) { toast.error('Nom, email et nom du projet sont requis.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/cms/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      toast.success(data.emailSent ? 'Client créé et invitation envoyée !' : 'Client créé (email non parti, à renvoyer).')
      router.push(data.project?.id ? `/cms/projets/${data.project.id}` : '/cms/projets')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none'
  const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
  const labelCls = 'text-xs font-semibold block mb-1.5 uppercase tracking-wide'

  return (
    <div className="max-w-xl">
      <Link href="/cms/projets" className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--cms-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Retour aux projets
      </Link>

      <div className="mb-6">
        <p className="cms-eyebrow">Onboarding</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Inviter un <span className="cms-accent">client</span></h1>
        <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>Crée le client, son premier projet, et envoie-lui un lien d&apos;accès à son espace.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Nom du contact *</label><input required value={form.name} onChange={set('name')} className={inputCls} style={inputStyle} /></div>
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Email *</label><input required type="email" value={form.email} onChange={set('email')} className={inputCls} style={inputStyle} /></div>
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Entreprise</label><input value={form.company} onChange={set('company')} className={inputCls} style={inputStyle} /></div>
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Téléphone</label><input value={form.phone} onChange={set('phone')} className={inputCls} style={inputStyle} /></div>
        </div>
        <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Nom du projet *</label><input required value={form.projectName} onChange={set('projectName')} placeholder="Ex : Site vitrine Dupont" className={inputCls} style={inputStyle} /></div>

        <div className="flex items-center gap-2 rounded-xl p-3 text-xs" style={{ background: 'var(--cms-info-bg)', color: 'var(--cms-info-fg)' }}>
          <UserPlus className="w-4 h-4 shrink-0" />
          Le client recevra un email avec un lien magique pour accéder à son espace (phase Onboarding).
        </div>

        <button type="submit" disabled={loading} className="cms-btn cms-btn-primary w-full">
          {loading ? 'Création…' : <><Send className="w-4 h-4" /> Créer et inviter</>}
        </button>
      </form>
    </div>
  )
}
