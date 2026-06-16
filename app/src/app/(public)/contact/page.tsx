'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, AlertCircle, Check } from 'lucide-react'

const PROJECT_TYPES = [
  { id: 'site-vitrine', label: 'Site Vitrine', desc: 'Présentation de votre activité' },
  { id: 'site-catalogue', label: 'Site Catalogue', desc: 'Présentation produits sans vente' },
  { id: 'site-ecommerce', label: 'Site E-Commerce', desc: 'Boutique en ligne complète' },
  { id: 'crm-automatisation', label: 'CRM / Automatisation', desc: 'Outil métier sur mesure' },
  { id: 'seo', label: 'SEO Référencement', desc: 'Optimisation Google' },
  { id: 'visibilite-ia', label: 'Visibilité IA (AEO)', desc: 'Être cité par ChatGPT & co' },
  { id: 'video-contenu-ia', label: 'Vidéo & Contenu IA', desc: 'Reels et vidéos chaque semaine' },
  { id: 'formation-ia', label: 'Formation IA', desc: 'Sessions individuelles 2h' },
  { id: 'maintenance', label: 'Maintenance seule', desc: 'Support technique existant' },
]

const BUDGETS = [
  { id: 'moins-1500', label: '< 1 500 €', desc: 'Projet simple / template' },
  { id: '1500-3000', label: '1 500 – 3 000 €', desc: 'Site sur-mesure entrée de gamme' },
  { id: '3000-6000', label: '3 000 – 6 000 €', desc: 'Projet complet & fonctionnel' },
  { id: '6000-plus', label: '6 000 € +', desc: 'Plateforme avancée / CRM / IA' },
  { id: 'non-defini', label: 'Pas encore défini', desc: 'Je veux d\'abord un devis' },
]

const EMPTY = { nom: '', email: '', telephone: '', service: '', budget: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Présélectionne le service (?service=) et la formule choisie (?formule=) passés par les boutons "Choisir"
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const param = params.get('service')
    const formule = params.get('formule')
    setForm(p => ({
      ...p,
      service: param && PROJECT_TYPES.some(t => t.id === param) ? param : p.service,
      message: formule ? `Formule souhaitée : ${formule}.\n\n${p.message}` : p.message,
    }))
  }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Demande reçue !</h2>
        <p className="text-muted-foreground">Je reviens vers vous sous 24h avec un devis personnalisé.</p>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Devis Gratuit</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-3">
            Lançons votre <span className="italic font-normal">projet ensemble</span>
          </h1>
          <p className="text-muted-foreground mb-10">Réponse garantie sous 24h, sans engagement.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl border border-border p-8">
            <h3 className="font-semibold text-foreground mb-5">Type de projet</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROJECT_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => set('service', t.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${form.service === t.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  {form.service === t.id && <Check className="w-3.5 h-3.5 mt-2" style={{ color: '#F4521E' }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8">
            <h3 className="font-semibold text-foreground mb-5">Budget estimé</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUDGETS.map(b => (
                <button key={b.id} type="button" onClick={() => set('budget', b.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${form.budget === b.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                  <p className="text-sm font-semibold text-foreground">{b.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                  {form.budget === b.id && <Check className="w-3.5 h-3.5 mt-2" style={{ color: '#F4521E' }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8 space-y-5">
            <h3 className="font-semibold text-foreground">Vos coordonnées</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {[['Nom *', 'nom', 'text', true], ['Email *', 'email', 'email', true], ['Téléphone', 'telephone', 'tel', false]].map(([label, name, type, req]) => (
                <div key={String(name)}>
                  <label className="text-sm font-medium text-foreground block mb-1.5">{String(label)}</label>
                  <input required={Boolean(req)} type={String(type)} value={form[name as keyof typeof form]}
                    onChange={e => set(String(name), e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Message / Détails du projet</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4} placeholder="Décrivez votre projet, vos contraintes, vos objectifs..."
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 resize-none" />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Une erreur est survenue. Réessayez ou écrivez à contact@vivesmedia.com
            </div>
          )}

          <button type="submit" disabled={status === 'loading' || !form.nom || !form.email}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-full transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#F4521E' }}>
            {status === 'loading' ? 'Envoi en cours...' : <><span>Envoyer ma demande</span><ArrowUpRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
