'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function CmsLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    router.replace('/cms/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0F172A' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: '#F4521E' }}>
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="font-bold text-xl text-white tracking-tight">
            vives<span style={{ color: '#F4521E' }}>media</span><span style={{ color: 'rgba(255,255,255,.3)' }}>.com</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.35)' }}>Espace administration</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,.4)' }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,.4)' }}>
                Mot de passe
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }} />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90 mt-2"
              style={{ background: '#F4521E' }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
