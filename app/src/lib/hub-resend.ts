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

// ── Emails CLIENT (déclenchés par l'admin depuis /cms/projets) ──
export async function sendPhaseChangeEmail(p: { to: string; clientName: string; projectName: string; phaseLabel: string; dashboardUrl: string; note?: string }) {
  await send(
    p.to,
    `Votre projet ${p.projectName} avance : ${p.phaseLabel}`,
    `<p>Bonjour ${esc(p.clientName)},</p><p>Votre projet <b>${esc(p.projectName)}</b> passe en phase <b>${esc(p.phaseLabel)}</b>.</p>${p.note ? `<p>${esc(p.note)}</p>` : ''}<p><a href="${esc(p.dashboardUrl)}">Voir l'avancement</a></p><p>Béranger, vivesmedia.com</p>`,
  )
}

export async function sendNewFileEmail(p: { to: string; clientName: string; projectName: string; fileName: string; fileCategory: string; dashboardUrl: string }) {
  await send(
    p.to,
    `Nouveau document sur ${p.projectName}`,
    `<p>Bonjour ${esc(p.clientName)},</p><p>Un nouveau document (<b>${esc(p.fileName)}</b>, ${esc(p.fileCategory)}) a été déposé sur votre projet <b>${esc(p.projectName)}</b>.</p><p><a href="${esc(p.dashboardUrl)}">Le consulter</a></p><p>Béranger, vivesmedia.com</p>`,
  )
}

export async function sendReviewRequestEmail(p: { to: string; clientName: string; projectName: string; reviewUrl: string }) {
  await send(
    p.to,
    'Un petit avis sur notre collaboration ?',
    `<p>Bonjour ${esc(p.clientName)},</p><p>J'espère que <b>${esc(p.projectName)}</b> vous donne entière satisfaction. Si vous avez 2 minutes, un avis Google m'aiderait beaucoup à développer mon activité.</p><p><a href="${esc(p.reviewUrl)}">Laisser un avis</a></p><p>Merci beaucoup, Béranger, vivesmedia.com</p>`,
  )
}
