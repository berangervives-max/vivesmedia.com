'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'

type Mode = 'login' | 'forgot' | 'sent' | 'recovery'

export default function CmsLoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const sb = createClient()

  // Arrivée via le lien de réinitialisation reçu par email → mode "nouveau mot de passe".
  useEffect(() => {
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('recovery')
    })
    return () => sub.subscription.unsubscribe()
  }, [sb])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
    router.replace('/cms/dashboard')
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/cms/login` })
    setLoading(false)
    if (error) { setError("Impossible d'envoyer l'email. Réessaie."); return }
    setMode('sent')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('8 caractères minimum.'); return }
    if (password !== password2) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setLoading(true)
    const { error } = await sb.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Impossible de mettre à jour le mot de passe.'); return }
    setOk('Mot de passe mis à jour.')
    setTimeout(() => router.replace('/cms/dashboard'), 900)
  }

  const inputWrap = 'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl'
  const inputWrapStyle = { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' } as const
  const inputStyle = { background: 'transparent', color: '#fff' } as const
  const labelCls = 'text-[11px] font-semibold uppercase tracking-wider block mb-1.5'
  const labelStyle = { color: 'rgba(255,255,255,.4)' } as const

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--cms-sidebar)' }}>
      {/* Halo orange doux */}
      <div className="absolute pointer-events-none" style={{ top: '-160px', left: '50%', transform: 'translateX(-50%)', width: 620, height: 420, borderRadius: '9999px', background: 'radial-gradient(circle, rgba(244,82,30,.22) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative">
        {/* Wordmark (jamais la tuile « V ») */}
        <div className="text-center mb-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: 'var(--cms-brand)' }}>Console d&apos;administration</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#fff' }}>
            vivesmedia<span style={{ color: 'var(--cms-brand)' }}>.com</span>
          </h1>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(6px)' }}>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls} style={labelStyle}>Email</label>
                <div className={inputWrap} style={inputWrapStyle}>
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,.35)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="w-full text-sm outline-none" style={inputStyle} placeholder="toi@vivesmedia.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls + ' mb-0'} style={labelStyle}>Mot de passe</label>
                  <button type="button" onClick={() => { setMode('forgot'); setError('') }} className="text-[11px] hover:underline" style={{ color: 'rgba(255,255,255,.45)' }}>Oublié ?</button>
                </div>
                <div className={inputWrap} style={inputWrapStyle}>
                  <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,.35)' }} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full text-sm outline-none" style={inputStyle} placeholder="••••••••" />
                </div>
              </div>
              {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(196,57,47,.14)', color: '#F2B8B2' }}>{error}</p>}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90 mt-1" style={{ background: 'var(--cms-brand)', boxShadow: 'var(--cms-glow)' }}>
                {loading ? 'Connexion…' : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4" style={{ color: 'var(--cms-brand)' }} />
                <p className="text-sm font-semibold text-white">Réinitialiser le mot de passe</p>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>On t&apos;envoie un lien sécurisé par email pour choisir un nouveau mot de passe.</p>
              <div className={inputWrap} style={inputWrapStyle}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,.35)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="w-full text-sm outline-none" style={inputStyle} placeholder="toi@vivesmedia.com" />
              </div>
              {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(196,57,47,.14)', color: '#F2B8B2' }}>{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90" style={{ background: 'var(--cms-brand)' }}>
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
              <button type="button" onClick={() => { setMode('login'); setError('') }} className="w-full text-xs hover:underline" style={{ color: 'rgba(255,255,255,.4)' }}>← Retour</button>
            </form>
          )}

          {mode === 'sent' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(244,82,30,.14)' }}>
                <Mail className="w-5 h-5" style={{ color: 'var(--cms-brand)' }} />
              </div>
              <p className="text-sm text-white">Lien envoyé à<br /><b>{email}</b>.</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>Ouvre l&apos;email et clique le lien pour choisir un nouveau mot de passe.</p>
              <button onClick={() => setMode('login')} className="text-xs hover:underline" style={{ color: 'rgba(255,255,255,.5)' }}>← Retour à la connexion</button>
            </div>
          )}

          {mode === 'recovery' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--cms-brand)' }} />
                <p className="text-sm font-semibold text-white">Nouveau mot de passe</p>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Nouveau mot de passe</label>
                <div className={inputWrap} style={inputWrapStyle}>
                  <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,.35)' }} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="w-full text-sm outline-none" style={inputStyle} placeholder="8 caractères minimum" />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Confirmer</label>
                <div className={inputWrap} style={inputWrapStyle}>
                  <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,.35)' }} />
                  <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required className="w-full text-sm outline-none" style={inputStyle} placeholder="••••••••" />
                </div>
              </div>
              {error && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(196,57,47,.14)', color: '#F2B8B2' }}>{error}</p>}
              {ok && <p className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(46,139,90,.16)', color: '#8FD3AE' }}>{ok}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90" style={{ background: 'var(--cms-brand)' }}>
                {loading ? 'Mise à jour…' : 'Valider le nouveau mot de passe'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'rgba(255,255,255,.28)' }}>Accès réservé · vivesmedia.com · Avignon</p>
      </div>
    </div>
  )
}
