'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, AlertCircle, Check } from 'lucide-react'
import { track } from '@/lib/analytics'

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

const EMPTY = { nom: '', email: '', telephone: '', service: '', budget: '', message: '', website: '' }

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  // Vérification email par code (anti-faux email)
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [token, setToken] = useState('')
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const sendCode = async () => {
    if (!emailValid(form.email)) { setCodeMsg({ ok: false, text: 'Entrez un email valide d\'abord.' }); return }
    setSending(true); setCodeMsg(null)
    try {
      const r = await fetch('/api/devis/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.token) { setToken(d.token); setCodeSent(true); setCodeMsg({ ok: true, text: `Code envoyé à ${form.email}. Regarde ta boîte (et les spams).` }) }
      else setCodeMsg({ ok: false, text: d.error || 'Envoi impossible.' })
    } catch { setCodeMsg({ ok: false, text: 'Erreur réseau.' }) }
    finally { setSending(false) }
  }

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

  const startedRef = useRef(false)
  const set = (k: string, v: string) => {
    if (!startedRef.current) {
      startedRef.current = true
      track('devis_started', { source: form.service ? 'preselected' : 'direct', service: form.service || null })
    }
    if (k === 'email') { setCodeSent(false); setToken(''); setCode(''); setCodeMsg(null) }
    setForm(p => ({ ...p, [k]: v }))
  }
  const filledCount = [form.service, form.budget, form.nom, form.email].filter(Boolean).length
  const progress = Math.round((filledCount / 4) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, code, token }) })
      if (!res.ok) throw new Error()
      track('devis_submitted', {
        service: form.service || null,
        budget: form.budget || null,
        has_message: !!form.message.trim(),
        has_phone: !!form.telephone.trim(),
      })
      setStatus('success')
    } catch {
      track('devis_failed', { reason: 'request_error', service: form.service || null })
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

        <div className="mb-8">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground">Progression de votre demande</span>
            <span className="font-semibold" style={{ color: '#F4521E' }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-foreground/10">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: '#F4521E' }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Honeypot anti-bot : invisible pour un humain, rempli par les bots */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={form.website} onChange={e => set('website', e.target.value)}
            className="absolute left-[-9999px] top-0 w-px h-px opacity-0" />
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
            {/* Vérification email (anti-faux email) */}
            <div className="rounded-xl p-4" style={{ background: '#FFF7F4', border: '1px solid #FCD9CC' }}>
              {!codeSent ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={sendCode} disabled={sending || !emailValid(form.email)}
                    className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50" style={{ background: '#F4521E' }}>
                    {sending ? 'Envoi…' : '✉️ Vérifier mon email'}
                  </button>
                  <span className="text-xs text-muted-foreground">On vous envoie un code à 6 chiffres pour confirmer votre adresse (obligatoire).</span>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Code reçu par email</label>
                  <div className="flex items-center gap-3">
                    <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="123456"
                      className="w-32 px-4 py-2.5 rounded-xl border border-border text-sm tracking-widest text-center focus:outline-none focus:border-foreground/30" />
                    <button type="button" onClick={sendCode} disabled={sending} className="text-xs underline text-muted-foreground">Renvoyer le code</button>
                    {code.length === 6 && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> prêt</span>}
                  </div>
                </div>
              )}
              {codeMsg && <p className="text-xs mt-2" style={{ color: codeMsg.ok ? '#16A34A' : '#DC2626' }}>{codeMsg.text}</p>}
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

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {['Réponse sous 24 h', 'Sans engagement', '100 % gratuit'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: '#F4521E' }} /> {t}</span>
            ))}
          </div>

          <button type="submit" disabled={status === 'loading' || !form.nom || !form.email || !codeSent || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-full transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#F4521E' }}>
            {status === 'loading' ? 'Envoi en cours...' : !codeSent ? 'Vérifiez votre email d\'abord' : code.length !== 6 ? 'Saisissez le code reçu' : <><span>Envoyer ma demande</span><ArrowUpRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
