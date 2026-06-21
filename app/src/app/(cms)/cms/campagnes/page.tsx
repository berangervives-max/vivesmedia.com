'use client'
import { useEffect, useState } from 'react'
import { newsletterService } from '@/services/supabase.service'
import { Send, Users, Eye, Sparkles, Info } from 'lucide-react'

const ORANGE = '#F4521E'

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
      setResult({ ok: true, msg: 'Email test envoyé sur ta boîte ✓ — vérifie le rendu avant l\'envoi réel.' })
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
      setResult({ ok: true, msg: `Campagne envoyée à ${data.sent} abonné(s) ✓` })
      setSubject(''); setBody(''); setVars({})
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : 'Erreur envoi' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(244,82,30,.1)', color: ORANGE }}>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111827' }}>{abonnes ?? '—'}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Destinataires actifs</p>
        </div>
        <div className="rounded-xl p-5 sm:col-span-2 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <Info className="w-4 h-4 shrink-0" style={{ color: '#16A34A' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#166534' }}>
            <strong>Envoi Resend connecté.</strong> La campagne part depuis contact@vivesmedia.com avec le template aux couleurs vivesmedia. Confirmation demandée avant chaque envoi — rien ne part par accident.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Éditeur */}
        <div className="lg:col-span-2 rounded-xl p-6 space-y-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Composer une campagne</h2>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#9CA3AF' }}>Objet</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet de l'email…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-orange-300"
              style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', color: '#111827' }} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#9CA3AF' }}>Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={12} placeholder="Rédige ton message… (les variables {{titre}}, {{lien}}, {{date}} seront remplacées)"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none leading-relaxed transition-colors focus:border-orange-300"
              style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', color: '#111827' }} />
          </div>

          {varNames.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#9CA3AF' }}>Variables à remplir</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {varNames.map(name => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs font-mono shrink-0" style={{ color: ORANGE }}>{`{{${name}}}`}</span>
                    <input value={vars[name] || ''} onChange={e => setVars(p => ({ ...p, [name]: e.target.value }))} placeholder={`valeur de ${name}`}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', color: '#111827' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button onClick={() => setPreview(p => !p)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              <Eye className="w-4 h-4" /> {preview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button onClick={handleTest} disabled={testing || !subject || !body}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
              style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
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
                ? { background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' }
                : { background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
              {result.msg}
            </div>
          )}

          {/* Préview */}
          {preview && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E9ECEF' }}>
              <div className="px-4 py-3" style={{ background: '#F8F9FA', borderBottom: '1px solid #E9ECEF' }}>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>De : vivesmedia.com &lt;contact@vivesmedia.com&gt;</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#111827' }}>{applyVars(subject) || '(sans objet)'}</p>
              </div>
              <div className="p-5">
                <div className="h-1 w-12 rounded-full mb-4" style={{ background: ORANGE }} />
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#374151' }}>{applyVars(body) || '(message vide)'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modèles */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Modèles rapides</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Clique pour pré-remplir</p>
          <div className="space-y-2">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className="w-full text-left p-3.5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ background: '#F8F9FA', border: '1px solid #F1F3F5' }}>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{t.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{t.subject}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #F1F3F5' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
              💡 Conseil : une campagne par mois maximum. Du concret (nouveauté, article utile, offre) — jamais de remplissage.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
