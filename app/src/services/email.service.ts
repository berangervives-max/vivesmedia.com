// Échappe une valeur avant de l'interpoler dans du HTML d'email — toute donnée
// saisie par un visiteur (lead, devis...) doit passer par ici avant d'atterrir
// dans un template, sinon injection HTML possible dans la boîte de réception.
function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Domaine vivesmedia.com vérifié dans Resend (DKIM + SPF + DMARC, 20/06/2026)
// → envoi possible vers n'importe quel destinataire depuis contact@vivesmedia.com.
const FROM = 'vivesmedia.com <contact@vivesmedia.com>'
// ADMIN reste sur le Gmail : c'est la boîte de RÉCEPTION réelle (pas de mailbox sur le domaine).
const ADMIN = 'berangervives@gmail.com'

async function send(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_PLACEHOLDER') {
    console.log('[email] RESEND_API_KEY manquante — email non envoyé:', { to, subject })
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[email] Erreur Resend:', err)
  }
}

export async function sendDevisReceived(devis: { nom: string; email: string; service?: string; message?: string }) {
  await Promise.all([
    send(ADMIN, `Nouveau devis — ${devis.nom}`, `
      <h2>Nouveau devis reçu</h2>
      <p><strong>Nom :</strong> ${devis.nom}</p>
      <p><strong>Email :</strong> ${devis.email}</p>
      <p><strong>Service :</strong> ${devis.service || '—'}</p>
      <p><strong>Message :</strong> ${devis.message || '—'}</p>
    `),
    send(devis.email, 'Votre demande a bien été reçue — vivesmedia.com', `
      <h2>Bonjour ${devis.nom},</h2>
      <p>Merci pour votre demande. Je reviendrai vers vous dans les 24h.</p>
      <p>— Béranger Vives · <a href="https://vivesmedia.com">vivesmedia.com</a></p>
    `),
  ])
}

export async function sendLeadConfirmation(lead: { email: string; source?: string }) {
  await Promise.all([
    send(ADMIN, `Nouveau lead (capture rapide) — ${esc(lead.email)}`, `
      <h2>Nouveau lead</h2>
      <p><strong>Email :</strong> ${esc(lead.email)}</p>
      <p><strong>Source :</strong> ${esc(lead.source || 'accueil')}</p>
      <p>À recontacter sous 24h (promesse envoyée au visiteur).</p>
    `),
    send(lead.email, "C'est noté, je reviens vers vous sous 24h — vivesmedia.com", `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;text-align:center;color:#17150f">
      <p style="font-weight:700;font-size:14px;margin:0 0 20px">vivesmedia<span style="color:#FF6B00">.com</span></p>
      <h2 style="font-size:24px;margin:0 0 14px">C'est noté.</h2>
      <p style="font-size:14px;line-height:1.6;color:rgba(23,21,15,.75);max-width:380px;margin:0 auto 18px">
        Merci pour votre message. Je l'ai bien reçu et je vous recontacte personnellement sous 24h, du lundi au vendredi.
        En attendant, vous pouvez réserver un créneau directement dans mon agenda.
      </p>
      <div style="display:flex;justify-content:center;gap:20px;margin:20px 0">
        <div><div style="font-weight:700;font-size:16px">5+</div><div style="font-size:10px;color:rgba(23,21,15,.5)">ans d'expérience</div></div>
        <div><div style="font-weight:700;font-size:16px">100%</div><div style="font-size:10px;color:rgba(23,21,15,.5)">full remote, France</div></div>
        <div><div style="font-weight:700;font-size:16px">Vives Reports</div><div style="font-size:10px;color:rgba(23,21,15,.5)">client réel, en ligne</div></div>
      </div>
      <a href="https://vivesmedia.com/contact" style="display:inline-block;background:#FF6B00;color:#fff;font-weight:600;font-size:13px;padding:12px 24px;border-radius:999px;text-decoration:none;margin-top:6px">Réserver un appel de 30 min</a>
      <p style="font-size:10px;color:rgba(23,21,15,.42);margin-top:28px;line-height:1.6">
        vivesmedia.com · Béranger Vives, entrepreneur individuel · RCS Avignon<br>
        Vous recevez cet email car vous avez laissé votre contact sur vivesmedia.com
      </p>
    </div>
  `),
  ])
}

export async function sendFacture(facture: { client_email: string; client_nom: string; numero: string; montant_ttc: number; stripe_payment_link?: string }) {
  await send(facture.client_email, `Facture ${facture.numero} — vivesmedia.com`, `
    <h2>Bonjour ${facture.client_nom},</h2>
    <p>Veuillez trouver ci-joint votre facture <strong>${facture.numero}</strong> d'un montant de <strong>${facture.montant_ttc.toFixed(2)} € TTC</strong>.</p>
    ${facture.stripe_payment_link ? `<p><a href="${facture.stripe_payment_link}" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Payer en ligne</a></p>` : ''}
    <p>— Béranger Vives · <a href="https://vivesmedia.com">vivesmedia.com</a></p>
  `)
}

export async function sendFollowup(client: { email: string; nom: string }) {
  await send(client.email, 'Des nouvelles de votre projet ? — vivesmedia.com', `
    <h2>Bonjour ${client.nom},</h2>
    <p>Je voulais prendre de vos nouvelles concernant votre projet web.</p>
    <p>N'hésitez pas à me répondre directement ou à <a href="https://vivesmedia.com/contact">planifier un appel</a>.</p>
    <p>— Béranger Vives · <a href="https://vivesmedia.com">vivesmedia.com</a></p>
  `)
}

export async function sendTestimonialRequest(client: { email: string; nom: string }) {
  await send(client.email, 'Votre avis compte pour nous — vivesmedia.com', `
    <h2>Bonjour ${client.nom},</h2>
    <p>Votre projet est terminé depuis un mois et j'espère que vous êtes satisfait du résultat.</p>
    <p>Pourriez-vous laisser un avis Google ? Cela ne prend que 2 minutes et m'aide énormément.</p>
    <p><a href="https://g.page/r/CVrzNHW-E9f0EAE/review" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Laisser un avis</a></p>
    <p>— Béranger Vives · <a href="https://vivesmedia.com">vivesmedia.com</a></p>
  `)
}

export async function sendMaintenanceUpsell(client: { email: string; nom: string }) {
  await send(client.email, 'Maintenez votre site au top — vivesmedia.com', `
    <h2>Bonjour ${client.nom},</h2>
    <p>Cela fait plus de 6 mois que votre site est en ligne. Il est peut-être temps de faire un point : mises à jour, optimisations SEO, nouvelles fonctionnalités.</p>
    <p>Je propose un <strong>pack maintenance mensuel</strong> pour garder votre site performant.</p>
    <p><a href="https://vivesmedia.com/tarifs" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Voir les tarifs</a></p>
    <p>— Béranger Vives · <a href="https://vivesmedia.com">vivesmedia.com</a></p>
  `)
}

export async function sendBlogDigest(subscribers: string[], articles: { titre: string; slug: string; extrait?: string }[]) {
  const articlesHtml = articles.map(a => `
    <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #eee">
      <h3><a href="https://vivesmedia.com/blog/${a.slug}">${a.titre}</a></h3>
      ${a.extrait ? `<p>${a.extrait}</p>` : ''}
    </div>
  `).join('')
  for (const email of subscribers) {
    await send(email, 'Les derniers articles vivesmedia.com', `
      <h2>Les articles du mois</h2>
      ${articlesHtml}
      <p><small><a href="https://vivesmedia.com/unsubscribe?email=${email}">Se désabonner</a></small></p>
    `)
  }
}

export async function sendOverdueAlert(factures: { numero: string; client_nom: string; montant_ttc: number; date_echeance: string }[]) {
  if (!factures.length) return
  const rows = factures.map(f => `<tr><td>${f.numero}</td><td>${f.client_nom}</td><td>${f.montant_ttc.toFixed(2)} €</td><td>${f.date_echeance}</td></tr>`).join('')
  await send(ADMIN, `${factures.length} facture(s) impayée(s) — vivesmedia.com`, `
    <h2>Factures en retard</h2>
    <table border="1" cellpadding="8" style="border-collapse:collapse">
      <tr><th>Numéro</th><th>Client</th><th>Montant TTC</th><th>Échéance</th></tr>
      ${rows}
    </table>
  `)
}

export async function sendRevenueReport(data: { mois: string; total: number; payees: number; en_attente: number }) {
  await send(ADMIN, `Rapport revenus ${data.mois} — vivesmedia.com`, `
    <h2>Rapport mensuel — ${data.mois}</h2>
    <p><strong>Total encaissé :</strong> ${data.total.toFixed(2)} €</p>
    <p><strong>Factures payées :</strong> ${data.payees}</p>
    <p><strong>En attente :</strong> ${data.en_attente}</p>
  `)
}
