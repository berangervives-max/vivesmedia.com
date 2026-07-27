'use client'
import { useEffect, useState } from 'react'
import { newsletterService } from '@/services/supabase.service'
import { createClient } from '@/lib/supabase'
import { Send, Users, Eye, Sparkles, Info, MailOpen } from 'lucide-react'
import Kpis from '@/components/cms/Kpis'

type CampLog = { id: string; subject: string; sent: number; at: string; opens: number }

const ORANGE = 'var(--cms-brand)'

const TEMPLATES = [
  { id: 'nouveaute', label: 'Annonce nouveauté', subject: 'Nouveau chez vivesmedia.com : {{titre}}', body: 'Bonjour,\n\nJ\'ai le plaisir de vous annoncer...\n\n— Béranger Vives · vivesmedia.com' },
  { id: 'article', label: 'Nouvel article de blog', subject: 'Nouvel article : {{titre}}', body: 'Bonjour,\n\nJe viens de publier un nouvel article qui pourrait vous intéresser :\n\n{{titre}}\n{{lien}}\n\nBonne lecture !\n\n— Béranger Vives · vivesmedia.com' },
  { id: 'promo', label: 'Offre spéciale', subject: 'Offre limitée — {{titre}}', body: 'Bonjour,\n\nJusqu\'au {{date}}, profitez de...\n\n— Béranger Vives · vivesmedia.com' },
]

export default function CampagnesPage() {
  const [abonnes, setAbonnes] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [vars, setVars] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<CampLog[]>([])

  const loadHistory = () => {
    const sb = createClient()
    sb.from('automation_logs').select('type,payload,created_at').in('type', ['campagne', 'email_open'])
      .order('created_at', { ascending: false }).limit(300)
      .then(({ data }) => {
        const rows = (data ?? []) as { type: string; payload: Record<string, unknown> | null; created_at: string }[]
        const opens: Record<string, number> = {}
        for (const r of rows) {
          if (r.type !== 'email_open') continue
          const c = r.payload?.campaign as string | undefined
          if (c) opens[c] = (opens[c] || 0) + 1
        }
        setHistory(rows.filter(r => r.type === 'campagne').map(r => {
          const p = r.payload || {}
          const id = (p.id as string) || r.created_at
          return { id, subject: (p.subject as string) || '(sans objet)', sent: (p.sent as number) || 0, at: (p.at as string) || r.created_at, opens: opens[id] || 0 }
        }))
      }, () => {})
  }
  useEffect(() => { loadHistory() }, [])

  // Variables {{x}} présentes dans l'objet ou le corps → champs à remplir
  const varNames = Array.from(new Set([...`${subject} ${body}`.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1])))
  const applyVars = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`)

  useEffect(() => {
    newsletterService.getAll()
      .then(n => setAbonnes(n.filter(x => x.actif).length))
      .catch(() => setAbonnes(null))
  }, [])

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setSubject(t.subject)
    setBody(t.body)
  }

  const post = (test: boolean) =>
    fetch('/api/cms/campagne', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: applyVars(subject), body: applyVars(body), test }),
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Erreur envoi'); return d })

  const handleTest = async () => {
    if (!subject || !body) { setResult({ ok: false, msg: 'Objet et message requis.' }); return }
    setTesting(true); setResult(null)
    try {
      await post(true)
      setResult({ ok: true, msg: 'Email test envoyé sur ta boîte, vérifie le rendu avant l\'envoi réel.' })
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : 'Erreur envoi' })
    } finally { setTesting(false) }
  }

  const handleSend = async () => {
    if (!subject || !body) { setResult({ ok: false, msg: 'Objet et message requis.' }); return }
    if (!confirm(`Envoyer cette campagne à ${abonnes} abonné(s) ? Cette action est irréversible.`)) return
    setSending(true); setResult(null)
    try {
      const data = await post(false)
      setResult({ ok: true, msg: `Campagne envoyée à ${data.sent} abonné(s).` })
      setSubject(''); setBody(''); setVars({})
      setTimeout(loadHistory, 800)
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : 'Erreur envoi' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">

      <Kpis items={[
        { label: 'Destinataires actifs', value: abonnes ?? '—', icon: Users, color: 'var(--cms-brand)' },
        { label: 'Campagnes envoyées', value: history.length, icon: Send, color: 'var(--cms-info-fg)' },
        { label: 'Emails envoyés', value: history.reduce((s, c) => s + (c.sent || 0), 0), icon: MailOpen, color: '#7C56C7' },
        { label: "Taux d'ouverture", value: (() => { const sent = history.reduce((s, c) => s + (c.sent || 0), 0); const op = history.reduce((s, c) => s + (c.opens || 0), 0); return sent ? `${Math.round(op / sent * 100)} %` : '—' })(), icon: Eye, color: 'var(--cms-ok-fg)', hint: 'moyenne historique' },
      ]} />

      {/* Bandeau info */}
      <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: 'var(--cms-ok-bg)', border: '1px solid var(--cms-ok-bg)' }}>
          <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-ok-fg)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--cms-ok-fg)' }}>
            <strong>Envoi Resend connecté.</strong> La campagne part depuis contact@vivesmedia.com avec le template aux couleurs vivesmedia. Confirmation demandée avant chaque envoi — rien ne part par accident.
          </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Éditeur */}
        <div className="lg:col-span-2 rounded-xl p-6 space-y-5" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--cms-ink)' }}>Composer une campagne</h2>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--cms-muted)' }}>Objet</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet de l'email…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-orange-300"
              style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)', color: 'var(--cms-ink)' }} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--cms-muted)' }}>Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={12} placeholder="Rédige ton message… (les variables {{titre}}, {{lien}}, {{date}} seront remplacées)"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none leading-relaxed transition-colors focus:border-orange-300"
              style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)', color: 'var(--cms-ink)' }} />
          </div>

          {varNames.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--cms-muted)' }}>Variables à remplir</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {varNames.map(name => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs font-mono shrink-0" style={{ color: ORANGE }}>{`{{${name}}}`}</span>
                    <input value={vars[name] || ''} onChange={e => setVars(p => ({ ...p, [name]: e.target.value }))} placeholder={`valeur de ${name}`}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)', color: 'var(--cms-ink)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button onClick={() => setPreview(p => !p)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
              <Eye className="w-4 h-4" /> {preview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button onClick={handleTest} disabled={testing || !subject || !body}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
              style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
              <Eye className="w-4 h-4" /> {testing ? 'Envoi…' : 'Envoi test (à moi)'}
            </button>
            <button onClick={handleSend} disabled={sending || !subject || !body || !abonnes}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: ORANGE }}>
              <Send className="w-4 h-4" /> {sending ? 'Envoi en cours…' : `Envoyer à ${abonnes ?? '…'} abonné${(abonnes ?? 0) > 1 ? 's' : ''}`}
            </button>
          </div>

          {result && (
            <div className="rounded-lg px-4 py-3 text-sm"
              style={result.ok
                ? { background: 'var(--cms-ok-bg)', border: '1px solid var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }
                : { background: 'var(--cms-danger-bg)', border: '1px solid var(--cms-danger-bg)', color: 'var(--cms-danger-fg)' }}>
              {result.msg}
            </div>
          )}

          {/* Préview */}
          {preview && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--cms-border)' }}>
              <div className="px-4 py-3" style={{ background: 'var(--cms-surface-2)', borderBottom: '1px solid var(--cms-border)' }}>
                <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>De : vivesmedia.com &lt;contact@vivesmedia.com&gt;</p>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--cms-ink)' }}>{applyVars(subject) || '(sans objet)'}</p>
              </div>
              <div className="p-5">
                <div className="h-1 w-12 rounded-full mb-4" style={{ background: ORANGE }} />
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--cms-ink-2)' }}>{applyVars(body) || '(message vide)'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modèles */}
        <div className="rounded-xl p-6" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: 'var(--cms-ink)' }}>Modèles rapides</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--cms-muted)' }}>Clique pour pré-remplir</p>
          <div className="space-y-2">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className="w-full text-left p-3.5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-surface-2)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--cms-ink)' }}>{t.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--cms-muted)' }}>{t.subject}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--cms-surface-2)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--cms-muted)' }}>
              Conseil : une campagne par mois maximum. Du concret (nouveauté, article utile, offre) — jamais de remplissage.
            </p>
          </div>
        </div>
      </div>

      {/* Historique des campagnes */}
      {history.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <MailOpen className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: 'var(--cms-ink)' }}>Historique des campagnes</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--cms-muted)' }}>Envois passés et taux d&apos;ouverture (si le webhook Resend est activé)</p>
          <div className="divide-y" style={{ borderColor: 'var(--cms-surface-2)' }}>
            {history.map(c => {
              const taux = c.sent > 0 ? Math.round((c.opens / c.sent) * 100) : 0
              return (
                <div key={c.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--cms-ink)' }}>{c.subject}</p>
                    <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{new Date(c.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} · {c.sent} destinataire{c.sent > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: c.opens > 0 ? ORANGE : 'var(--cms-muted)' }}>{c.opens} ouverture{c.opens > 1 ? 's' : ''}</p>
                    {c.opens > 0 && <p className="text-[11px]" style={{ color: 'var(--cms-muted)' }}>{taux}%</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
