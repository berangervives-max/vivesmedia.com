import 'server-only'

// Validation d'email "prête à brancher" : tant qu'aucune clé n'est posée, on ne
// bloque pas (le code OTP suffit). Dès que EMAIL_VALIDATION_API_KEY est définie,
// la vérification de DÉLIVRABILITÉ réelle s'active automatiquement (MX/SMTP/jetable).
//
// Provider par défaut : Reoon (600 vérifs/mois gratuites, temps réel < 0,5 s).
// Variables d'env à poser (Vercel) quand tu as la clé :
//   EMAIL_VALIDATION_API_KEY = <ta clé>
//   EMAIL_VALIDATION_PROVIDER = reoon | zerobounce | abstract   (défaut: reoon)

export type EmailCheck = { ok: boolean; status: string; provider: string; skipped?: boolean; reason?: string }

const TIMEOUT_MS = 6000
async function getJson(url: string): Promise<any | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const r = await fetch(url, { signal: ctrl.signal })
    clearTimeout(t)
    return r.ok ? await r.json() : null
  } catch { return null }
}

export async function validateEmail(email: string): Promise<EmailCheck> {
  const key = process.env.EMAIL_VALIDATION_API_KEY
  const provider = (process.env.EMAIL_VALIDATION_PROVIDER || 'reoon').toLowerCase()
  // Pas de clé → on n'a pas encore "payé" : on laisse passer (l'OTP reste la garantie).
  if (!key) return { ok: true, status: 'skipped', provider, skipped: true }

  const e = encodeURIComponent(email)
  let data: any = null
  if (provider === 'reoon') {
    data = await getJson(`https://emailverifier.reoon.com/api/v1/verify?email=${e}&key=${key}&mode=quick`)
    // Reoon: status ∈ valid | invalid | disposable | spamtrap | unknown ; is_safe_to_send
    const status = String(data?.status ?? 'unknown')
    if (!data) return { ok: true, status: 'unreachable', provider } // API muette → on ne bloque pas (OTP couvre)
    const bad = ['invalid', 'disposable', 'spamtrap']
    return { ok: !bad.includes(status), status, provider, reason: bad.includes(status) ? status : undefined }
  }
  if (provider === 'zerobounce') {
    data = await getJson(`https://api.zerobounce.net/v2/validate?api_key=${key}&email=${e}`)
    const status = String(data?.status ?? 'unknown') // valid | invalid | catch-all | spamtrap | abuse | do_not_mail | unknown
    if (!data) return { ok: true, status: 'unreachable', provider }
    const bad = ['invalid', 'spamtrap', 'abuse', 'do_not_mail']
    return { ok: !bad.includes(status), status, provider, reason: bad.includes(status) ? status : undefined }
  }
  if (provider === 'abstract') {
    data = await getJson(`https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${e}`)
    const deliver = String(data?.deliverability ?? 'UNKNOWN') // DELIVERABLE | UNDELIVERABLE | UNKNOWN
    const disp = data?.is_disposable_email?.value === true
    if (!data) return { ok: true, status: 'unreachable', provider }
    const ok = deliver !== 'UNDELIVERABLE' && !disp
    return { ok, status: deliver.toLowerCase() + (disp ? '+disposable' : ''), provider, reason: ok ? undefined : (disp ? 'disposable' : 'undeliverable') }
  }
  return { ok: true, status: 'no-provider', provider }
}
