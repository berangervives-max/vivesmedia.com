import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Diagnostic email : envoie un email de test et renvoie un résultat EXPLICITE
// (succès / échec + raison), au lieu du silence des automatisations. Admin uniquement.
const ADMIN = 'berangervives@gmail.com'

export async function POST(req: NextRequest) {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.email !== ADMIN) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 })
  }
  const key = process.env.RESEND_API_KEY
  if (!key) {
    return NextResponse.json({
      ok: false,
      error: "RESEND_API_KEY absente dans Vercel. C'est LA cause du silence : aucune automatisation ne peut envoyer d'email tant que cette variable n'est pas posée (Vercel → Settings → Environment Variables).",
    }, { status: 200 })
  }
  let res: Response
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'vivesmedia.com <contact@vivesmedia.com>',
        to: ADMIN,
        subject: '[vivesmedia] Email de test ✓',
        html: '<p style="font-family:Arial,sans-serif">Si tu lis ceci, le tuyau email <b>fonctionne</b>. Les automatisations (Conseiller hebdo, Posts réseaux, Prospect du jour) peuvent t\'écrire.</p><p style="font-family:Arial,sans-serif;color:#888;font-size:13px">Astuce : regarde l\'onglet <b>Promotions</b> ou <b>Spam</b> de Gmail si tu ne vois rien dans la boîte principale.</p>',
      }),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: `Réseau : ${(e as Error).message}` }, { status: 200 })
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: `Resend a refusé l'envoi : ${JSON.stringify(body).slice(0, 300)}` }, { status: 200 })
  }
  return NextResponse.json({ ok: true, id: (body as { id?: string })?.id ?? null })
}
