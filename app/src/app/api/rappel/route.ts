import { NextRequest, NextResponse } from 'next/server'
import { devisService } from '@/services/supabase.service'

// Chemin FAIBLE FRICTION : « rappel gratuit » avec juste nom + téléphone.
// Pas d'email/OTP (le téléphone est le canal). Crée un lead + notifie l'admin.
const FROM = 'vivesmedia.com <contact@vivesmedia.com>'
const ADMIN = 'berangervives@gmail.com'
const normPhone = (t: string) => t.replace(/[\s.\-]/g, '').replace(/^\+33/, '0')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    if (typeof body.website === 'string' && body.website.trim() !== '') return NextResponse.json({ success: true }) // honeypot
    const nom = String(body.nom ?? '').trim()
    const tel = normPhone(String(body.telephone ?? ''))
    if (!nom || nom.length > 120) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    if (!/^0[1-9]\d{8}$/.test(tel)) return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })

    const devis = await devisService.create({
      nom, email: '', telephone: tel, service: 'rappel', budget: '',
      message: 'Demande de RAPPEL (chemin rapide).', statut: 'nouveau', lu: false,
    })

    // Notifie l'admin (best-effort)
    const key = process.env.RESEND_API_KEY
    if (key) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: ADMIN, subject: `📞 Demande de rappel : ${nom} — ${tel}`,
          html: `<p style="font-family:Arial,sans-serif"><b>${nom}</b> demande un rappel.<br/>Téléphone : <b>${tel}</b></p><p style="color:#888;font-size:13px">Chemin rapide (sans email). À rappeler vite.</p>` }),
      }).catch(() => {})
    }
    return NextResponse.json({ success: true, id: devis.id })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
