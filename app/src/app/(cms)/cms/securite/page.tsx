'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, ShieldAlert, Smartphone, Check, Trash2, Loader2 } from 'lucide-react'

type Factor = { id: string; friendly_name?: string | null; status: string }

export default function CmsSecuritePage() {
  const sb = createClient()
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<{ factorId: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await sb.auth.mfa.listFactors()
    setFactors((data?.totp ?? []) as Factor[])
    setLoading(false)
  }, [sb])

  useEffect(() => { load() }, [load])

  const verified = factors.filter(f => f.status === 'verified')
  const active = verified.length > 0

  const startEnroll = async () => {
    setError(''); setBusy(true)
    // On nettoie les facteurs non vérifiés en attente (évite l'accumulation).
    for (const f of factors.filter(f => f.status !== 'verified')) { try { await sb.auth.mfa.unenroll({ factorId: f.id }) } catch { /* ignore */ } }
    const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `App ${new Date().toISOString().slice(0, 10)}` })
    setBusy(false)
    if (error || !data) { setError("Impossible de démarrer l'activation. La 2FA est-elle activée côté Supabase ?"); return }
    setEnrolling({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
  }

  const confirmEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrolling) return
    setError(''); setBusy(true)
    const { data: ch, error: chErr } = await sb.auth.mfa.challenge({ factorId: enrolling.factorId })
    if (chErr || !ch) { setBusy(false); setError('Erreur. Réessaie.'); return }
    const { error: vErr } = await sb.auth.mfa.verify({ factorId: enrolling.factorId, challengeId: ch.id, code: code.trim() })
    setBusy(false)
    if (vErr) { setError('Code incorrect. Vérifie l\'heure de ton téléphone et réessaie.'); return }
    setEnrolling(null); setCode(''); load()
  }

  const disable = async (factorId: string) => {
    if (!confirm('Désactiver la double authentification ? Ton compte sera moins protégé.')) return
    setBusy(true)
    await sb.auth.mfa.unenroll({ factorId })
    setBusy(false); load()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="cms-eyebrow">Sécurité</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Double authentification <span className="cms-accent">(2FA)</span></h1>
        <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>Ajoute une deuxième barrière : en plus du mot de passe, un code temporaire de ton téléphone.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: 'var(--cms-muted)' }} />
        </div>
      ) : (
        <>
          {/* Statut */}
          <div className="rounded-2xl p-5 mb-5 flex items-center gap-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: active ? 'var(--cms-ok-bg)' : 'var(--cms-warn-bg)' }}>
              {active ? <ShieldCheck className="w-5 h-5" style={{ color: 'var(--cms-ok-fg)' }} /> : <ShieldAlert className="w-5 h-5" style={{ color: 'var(--cms-warn-fg)' }} />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--cms-ink)' }}>{active ? '2FA activée' : '2FA non activée'}</p>
              <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{active ? 'Un code sera demandé à chaque connexion.' : 'Recommandé pour protéger ton back-office.'}</p>
            </div>
            {active && (
              <span className="cms-badge" style={{ background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }}><Check className="w-3 h-3" /> Actif</span>
            )}
          </div>

          {error && <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ background: 'var(--cms-danger-bg)', color: 'var(--cms-danger-fg)' }}>{error}</p>}

          {/* Facteurs actifs */}
          {verified.map(f => (
            <div key={f.id} className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
              <Smartphone className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} />
              <p className="flex-1 text-sm font-medium" style={{ color: 'var(--cms-ink)' }}>{f.friendly_name || 'Application d\'authentification'}</p>
              <button onClick={() => disable(f.id)} disabled={busy} className="p-2 rounded-lg" style={{ color: 'var(--cms-danger-fg)' }} title="Désactiver">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Activation */}
          {!active && !enrolling && (
            <button onClick={startEnroll} disabled={busy} className="cms-btn cms-btn-primary">
              {busy ? 'Préparation…' : 'Activer la double authentification'}
            </button>
          )}

          {enrolling && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--cms-ink)' }}>1. Scanne ce QR code</p>
              <p className="text-xs mb-4" style={{ color: 'var(--cms-muted)' }}>Avec Google Authenticator, Authy, ou 1Password sur ton téléphone.</p>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="rounded-xl p-3 bg-white border shrink-0" style={{ borderColor: 'var(--cms-border-2)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={enrolling.qr} alt="QR code 2FA" width={160} height={160} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-1" style={{ color: 'var(--cms-muted)' }}>Ou saisis cette clé manuellement :</p>
                  <code className="block text-xs break-all rounded-lg px-3 py-2 mb-4" style={{ background: 'var(--cms-surface-2)', color: 'var(--cms-ink-2)' }}>{enrolling.secret}</code>
                  <form onSubmit={confirmEnroll} className="space-y-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--cms-ink)' }}>2. Entre le code affiché</p>
                    <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus
                      className="w-full text-center text-xl font-bold tracking-[0.4em] py-2.5 rounded-xl outline-none"
                      style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink)' }} placeholder="000000" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={busy || code.length < 6} className="cms-btn cms-btn-primary flex-1">{busy ? 'Vérification…' : 'Activer'}</button>
                      <button type="button" onClick={() => { setEnrolling(null); setCode(''); setError('') }} className="cms-btn cms-btn-secondary">Annuler</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
