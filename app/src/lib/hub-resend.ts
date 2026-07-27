// Notifications admin de l'espace client (rapatriées du Hub), via l'API REST Resend
// (fetch, sans dépendance SDK). Fire-and-forget : silencieux si RESEND_API_KEY absente.
import type { TicketPriority } from '@/types/hub'

// Échappement HTML : les valeurs (nom client, titre/description de ticket…) sont
// contrôlables et ne doivent JAMAIS être injectées brutes dans le HTML de l'email.
const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'vivesmedia.com <hub@vivesmedia.com>', to, subject, html }),
    })
  } catch { /* non bloquant */ }
}

export async function sendAdminOnboardingCompleteAlert(p: { adminEmail: string; clientName: string; projectName: string; projectUrl: string }) {
  await send(
    p.adminEmail,
    `Onboarding complété — ${p.clientName}`,
    `<p><b>${esc(p.clientName)}</b> a complété le formulaire d'onboarding du projet <b>${esc(p.projectName)}</b>.</p><p><a href="${esc(p.projectUrl)}">Voir le projet</a></p>`,
  )
}

export async function sendAdminNewTicketAlert(p: { adminEmail: string; clientName: string; projectName: string; ticketTitle: string; ticketDescription: string; priority: TicketPriority; ticketUrl: string }) {
  await send(
    p.adminEmail,
    `Nouveau ticket (${p.priority}) — ${p.clientName}`,
    `<p><b>${esc(p.clientName)}</b> a ouvert un ticket sur <b>${esc(p.projectName)}</b>.</p><p><b>${esc(p.ticketTitle)}</b></p><p>${esc(p.ticketDescription)}</p><p>Priorité : ${esc(p.priority)}</p><p><a href="${esc(p.ticketUrl)}">Voir le projet</a></p>`,
  )
}
