import 'server-only'
import { createServiceClient } from '@/lib/supabase'
import { sendFollowup, sendTestimonialRequest, sendOverdueAlert, sendRevenueReport } from '@/services/email.service'

// ── Moteur d'automatisations ──────────────────────────────────────────────
// Registre déclaratif d'automatisations classées par onglet. Toutes tournent
// via le cron Vercel quotidien (api/cron). Chaque job est idempotent et écrit
// dans automation_logs (clé = id de l'automatisation) pour la traçabilité.

export type Onglet = 'Pilotage' | 'Ventes' | 'Marketing' | 'Hub Clients' | 'Outils'
export type Cadence = 'quotidien' | 'hebdo' | 'mensuel'

type Sb = ReturnType<typeof createServiceClient>
export type AutoCtx = {
  sb: Sb
  now: Date
  today: string
  ago: (days: number) => string
  mailAdmin: (subject: string, html: string) => Promise<void>
  ranToday: (id: string) => Promise<boolean>
  loggedIds: (id: string) => Promise<Set<string>>
  indexNow: (url: string) => Promise<void>
}
export type RunResult = { count: number; payload?: Record<string, unknown>; selfLogged?: boolean }

export type Automation = {
  id: string
  onglet: Onglet
  cible: string
  label: string
  desc: string
  cadence: Cadence
  run: (ctx: AutoCtx) => Promise<RunResult>
}

const DAY = 86_400_000
const euro = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`
const li = (s: string) => `<li style="margin:4px 0">${s}</li>`
const wrap = (title: string, body: string) =>
  `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827"><h2 style="font-size:16px;margin:0 0 12px">${title}</h2>${body}<p style="font-size:12px;color:#9CA3AF;margin-top:16px">— Automatisation vivesmedia.com</p></div>`

// Nettoie un nom d'entreprise open-data (forme juridique + parenthèses + MAJUSCULES) pour l'affichage.
const LEGAL_FORMS = /\b(SARLU|SARL|SASU|SAS|EURL|EIRL|EI|SNC|SCIC|SCI|SCM|SELARL|SELAS|SCOP|GAEC|SCEA|SA|ETS|ETABLISSEMENTS?)\b\.?/gi
function cleanCompanyName(raw?: string): string {
  let s = (raw || '').trim(); if (!s) return 'ce prospect'
  s = s.replace(/\([^)]*\)/g, ' ').replace(LEGAL_FORMS, ' ').replace(/\s{2,}/g, ' ').trim()
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '')
  if (letters && letters === letters.toUpperCase()) s = s.toLowerCase().replace(/\b([a-zà-ÿ])/g, (_m, c: string) => c.toUpperCase())
  return s || 'ce prospect'
}

// Audit GRATUIT d'un site (aucune clé externe) → score d'OPPORTUNITÉ /10 :
// plus le site est faible (pas de HTTPS, pas mobile, lent, builder bas de gamme),
// plus le score monte (= plus l'argument « refonte » est fort). Voir PROSPECTION/CIBLAGE_SITE_A_REFAIRE.md.
async function quickAudit(url: string): Promise<{ score10: number; lines: string[]; builder: string; reachable: boolean }> {
  if (!url) return { score10: 0, lines: [], builder: '', reachable: false }
  let u: URL
  try { u = new URL(url) } catch { return { score10: 0, lines: [], builder: '', reachable: false } }
  const t0 = Date.now()
  let resp: Response
  try {
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 10000)
    resp = await fetch(u.toString(), { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; vivesmedia-audit/1.0)' } })
    clearTimeout(timer)
  } catch {
    return { score10: 7, lines: ['le site ne répond pas (ou trop lentement) : vos visiteurs tombent sur une page vide'], builder: '', reachable: false }
  }
  const total = Date.now() - t0
  const isHttps = (resp.url || u.toString()).startsWith('https://')
  let html = ''
  try { const buf = await resp.arrayBuffer(); html = Buffer.from(buf.slice(0, 400_000)).toString('utf8') } catch { /* ignore */ }
  const h = html.toLowerCase()
  const gen = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i) || [])[1] || ''
  const builder = /wix\.com|static\.wixstatic/.test(h) ? 'Wix'
    : /squarespace/.test(h) ? 'Squarespace'
    : /jimdo/.test(h) ? 'Jimdo'
    : /godaddy|website builder/i.test(gen) ? 'GoDaddy'
    : /e-monsite|pagesperso-orange|perso\.numericable/.test(h) ? 'site perso bas de gamme'
    : /wp-content|wordpress/.test(h) ? 'WordPress' : gen
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html)
  const metaDesc = /<meta[^>]+name=["']description["']/i.test(html)
  let s = 0; const lines: string[] = []
  if (!isHttps) { s += 2; lines.push('site non sécurisé (pas de HTTPS) : Chrome affiche « non sécurisé », Google le déclasse') }
  if (!viewport) { s += 2; lines.push('pas de version mobile : le site s\'affiche mal sur téléphone (la majorité des visites)') }
  if (total > 2500) { s += 1; lines.push(`site lent (${(total / 1000).toFixed(1)}s) : une partie des visiteurs part avant l\'affichage`) }
  if (!metaDesc) { s += 1; lines.push('pas de description Google : moins de clics depuis la recherche') }
  if (['Wix', 'GoDaddy', 'Jimdo', 'site perso bas de gamme'].includes(builder)) { s += 3; lines.push(`site sur ${builder} : on peut faire plus rapide, mieux référencé et sur-mesure`) }
  return { score10: Math.min(10, s), lines: lines.slice(0, 4), builder, reachable: true }
}

// ── Catalogue ──────────────────────────────────────────────────────────────
export const AUTOMATIONS: Automation[] = [

  // ════════ PILOTAGE ════════
  {
    id: 'pil_digest_quotidien', onglet: 'Pilotage', cible: 'Dashboard', cadence: 'quotidien',
    label: 'Digest quotidien du matin', desc: 'Chaque jour : récapitulatif e-mail (devis non lus, factures en retard, ventes de la veille).',
    run: async ({ sb, ago, mailAdmin, ranToday }) => {
      if (await ranToday('pil_digest_quotidien')) return { count: 0 }
      const [{ data: devis }, { data: fact }, { data: cmd }] = await Promise.all([
        sb.from('devis').select('id,lu').eq('lu', false),
        sb.from('factures').select('id').eq('statut', 'en_retard'),
        sb.from('commandes').select('montant').eq('statut', 'paye').gte('created_at', ago(1)),
      ])
      const nonLus = devis?.length ?? 0, retard = fact?.length ?? 0
      const caJour = (cmd ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      if (nonLus === 0 && retard === 0 && caJour === 0) return { count: 0 }
      await mailAdmin('Ton récap du jour', wrap('Récap vivesmedia.com', `<ul>${li(`<b>${nonLus}</b> devis non lu(s)`)}${li(`<b>${retard}</b> facture(s) en retard`)}${li(`<b>${euro(caJour)}</b> encaissés hier`)}</ul>`))
      return { count: 1, payload: { nonLus, retard, caJour } }
    },
  },
  {
    id: 'pil_snapshot_kpi', onglet: 'Pilotage', cible: 'Dashboard', cadence: 'quotidien',
    label: 'Snapshot quotidien des KPI', desc: 'Archive chaque jour les indicateurs clés (clients, devis, CA du mois) pour suivre l\'évolution.',
    run: async ({ sb, now, ranToday }) => {
      if (await ranToday('pil_snapshot_kpi')) return { count: 0 }
      const moisDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const [{ data: cl }, { data: dv }, { data: fa }, { data: cm }] = await Promise.all([
        sb.from('site_clients').select('id'),
        sb.from('devis').select('id'),
        sb.from('factures').select('montant_ttc,statut,created_at').eq('statut', 'payee').gte('created_at', moisDebut),
        sb.from('commandes').select('montant,statut,created_at').eq('statut', 'paye').gte('created_at', moisDebut),
      ])
      const caMois = (fa ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0) + (cm ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      return { count: 1, payload: { clients: cl?.length ?? 0, devis: dv?.length ?? 0, caMois: Math.round(caMois) } }
    },
  },
  {
    id: 'pil_alerte_silence', onglet: 'Pilotage', cible: 'Dashboard', cadence: 'quotidien',
    label: 'Alerte activité en berne', desc: 'Prévient si aucun devis ni commande n\'est arrivé depuis 7 jours (signal de visibilité à relancer).',
    run: async ({ sb, ago, mailAdmin, ranToday }) => {
      if (await ranToday('pil_alerte_silence')) return { count: 0 }
      const [{ data: d }, { data: c }] = await Promise.all([
        sb.from('devis').select('id').gte('created_at', ago(7)),
        sb.from('commandes').select('id').gte('created_at', ago(7)),
      ])
      if ((d?.length ?? 0) > 0 || (c?.length ?? 0) > 0) return { count: 0 }
      await mailAdmin('Activité calme depuis 7 jours', wrap('Aucune nouvelle demande depuis 7 jours', '<p>Pense à relancer ta visibilité : un post, un article, une campagne, ou de la prospection.</p>'))
      return { count: 1 }
    },
  },

  // ════════ VENTES — Prospection ════════
  {
    id: 'prospect_du_jour', onglet: 'Ventes', cible: 'Clients', cadence: 'quotidien',
    label: 'Prospect du jour (audit gratuit)',
    desc: 'Chaque jour : sélectionne 1 prospect ayant un site, l\'audite gratuitement (HTTPS, mobile, vitesse, technologie), calcule un score d\'opportunité /10 et envoie une fiche prête à valider. N\'envoie RIEN au prospect (tu gardes la main sur l\'envoi).',
    run: async ({ sb, today, mailAdmin, ranToday }) => {
      if (await ranToday('prospect_du_jour')) return { count: 0 }
      const { data: rows } = await sb.from('site_clients')
        .select('id,nom,entreprise,secteur,notes,statut,created_at')
        .eq('statut', 'prospect')
        .order('created_at', { ascending: true })
        .limit(300)
      // Candidat : a un site dans les notes, pas encore audité automatiquement
      const candidat = (rows ?? []).find(r => /https?:\/\//.test(r.notes || '') && !/\[audit-auto/.test(r.notes || ''))
      if (!candidat) {
        await mailAdmin('Prospection : plus de prospect à auditer', wrap('File d\'audit vide',
          '<p>Tous les prospects ayant un site ont été audités. Ajoute de nouveaux prospects (open data) dans <b>/cms/clients</b> pour relancer le flux quotidien.</p>'))
        return { count: 0 }
      }
      const site = (String(candidat.notes).match(/https?:\/\/[^\s·]+/) || [])[0] || ''
      const a = await quickAudit(site)
      // Bonus secteur « fort ROI site » (proximité)
      const sect = (candidat.secteur || '').toLowerCase()
      const bonusSecteur = /restau|pizz|boulang|traiteur|caviste|bouch|coiff|beaut|osteo|kine|dentiste|plomb|electr|menuis|macon|peintr|carrel|paysag|garage|auto|immo|fleur|opticien|sport/.test(sect) ? 1 : 0
      const score = Math.min(10, a.score10 + bonusSecteur)
      // Marque la fiche pour ne pas ré-auditer le même prospect
      await sb.from('site_clients').update({ notes: (candidat.notes || '') + `\n[audit-auto ${today} · score ${score}/10]` }).eq('id', candidat.id)
      const ent = cleanCompanyName(candidat.entreprise || candidat.nom)
      const verdict = score >= 6 ? '✅ À CONTACTER en priorité' : score >= 4 ? '🟡 Tiède — à creuser' : '⚪ Peu prioritaire (site déjà correct)'
      const defauts = a.lines.length
        ? `<p style="margin:8px 0 4px"><b>Arguments « refonte » à utiliser :</b></p><ul>${a.lines.map(li).join('')}</ul>`
        : '<p style="margin:8px 0">Site plutôt sain — peu d\'arguments « refonte ». Plutôt un angle SEO/Google.</p>'
      await mailAdmin(`Prospect du jour : ${ent} — ${score}/10`, wrap(`Prospect du jour — ${verdict}`,
        `<p><b>${ent}</b>${candidat.secteur ? ` · ${candidat.secteur}` : ''}<br/>Site : ${site || '—'}${a.builder ? ` · ${a.builder}` : ''}${a.reachable ? '' : ' · <b>injoignable</b>'}</p>${defauts}<p style="margin-top:12px">👉 Ouvre la fiche dans <b>/cms/clients</b> (recherche « ${ent} ») pour générer l'email perso (déjà nettoyé) et valider l'envoi.</p>`))
      return { count: 1, payload: { id: candidat.id, ent, score, contacter: score >= 6 } }
    },
  },
  {
    id: 'stats_rapport_hebdo', onglet: 'Pilotage', cible: 'Statistiques', cadence: 'hebdo',
    label: 'Rapport hebdomadaire', desc: 'Chaque lundi : devis reçus, taux de conversion et CA encaissé de la semaine écoulée.',
    run: async ({ sb, ago, mailAdmin }) => {
      const since = ago(7)
      const [{ data: devis }, { data: fa }, { data: cm }] = await Promise.all([
        sb.from('devis').select('statut,created_at').gte('created_at', since),
        sb.from('factures').select('montant_ttc,statut,created_at').eq('statut', 'payee').gte('created_at', since),
        sb.from('commandes').select('montant,statut,created_at').eq('statut', 'paye').gte('created_at', since),
      ])
      const nb = devis?.length ?? 0
      const ca = (fa ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0) + (cm ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      await mailAdmin('Ton rapport de la semaine', wrap('Semaine écoulée', `<ul>${li(`<b>${nb}</b> nouvelles demandes de devis`)}${li(`<b>${euro(ca)}</b> encaissés`)}</ul>`))
      return { count: 1, payload: { devis: nb, ca: Math.round(ca) } }
    },
  },
  {
    id: 'monthly_report', onglet: 'Pilotage', cible: 'Statistiques', cadence: 'mensuel',
    label: 'Rapport mensuel de revenus', desc: 'Au début du mois : calcule le CA encaissé du mois précédent et l\'archive.',
    run: async ({ sb, now }) => {
      const moisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const moisKey = `${moisPrec.getFullYear()}-${String(moisPrec.getMonth() + 1).padStart(2, '0')}`
      const { data: existants } = await sb.from('automation_logs').select('payload').eq('type', 'monthly_report')
      if ((existants ?? []).some((l) => (l.payload as { mois?: string })?.mois === moisKey)) return { count: 0 }
      const debut = moisPrec.toISOString(), fin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const [{ data: fa }, { data: cm }] = await Promise.all([
        sb.from('factures').select('montant_ttc').eq('statut', 'payee').gte('created_at', debut).lt('created_at', fin),
        sb.from('commandes').select('montant').eq('statut', 'paye').gte('created_at', debut).lt('created_at', fin),
      ])
      const caF = (fa ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
      const caC = (cm ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      const total = Math.round(caF + caC)
      await sendRevenueReport({ mois: moisKey, total, payees: fa?.length ?? 0, en_attente: 0 }).catch(() => {})
      await sb.from('automation_logs').insert({ type: 'monthly_report', payload: { mois: moisKey, ca: total, factures: caF, commandes: caC } })
      return { count: 1, selfLogged: true }
    },
  },
  {
    id: 'trafic_rapport_hebdo', onglet: 'Pilotage', cible: 'Trafic web', cadence: 'hebdo',
    label: 'Rapport trafic hebdomadaire', desc: 'Chaque lundi : synthèse du trafic (PostHog) — visiteurs, pages d\'entrée, sources.',
    run: async ({ mailAdmin }) => {
      try {
        const { getPostHogData } = await import('@/lib/google-data')
        const d = await getPostHogData()
        const pv = (d as { pageviews?: number }).pageviews ?? 0
        const vis = (d as { visitors?: number }).visitors ?? 0
        await mailAdmin('Trafic de la semaine', wrap('Trafic (30 derniers jours)', `<ul>${li(`<b>${vis}</b> visiteurs`)}${li(`<b>${pv}</b> pages vues`)}</ul>`))
        return { count: 1, payload: { visitors: vis, pageviews: pv } }
      } catch { return { count: 0 } }
    },
  },
  {
    id: 'trafic_seo_hebdo', onglet: 'Pilotage', cible: 'Trafic web', cadence: 'hebdo',
    label: 'Veille SEO hebdomadaire', desc: 'Chaque lundi : clics et impressions Google Search Console de la semaine + top requêtes.',
    run: async () => {
      try {
        const { getGscData } = await import('@/lib/google-data')
        const g = await getGscData()
        const clicks = (g as { totals?: { clicks?: number } }).totals?.clicks ?? 0
        const impr = (g as { totals?: { impressions?: number } }).totals?.impressions ?? 0
        return { count: 1, payload: { clicks, impressions: impr } }
      } catch { return { count: 0 } }
    },
  },

  // ════════ VENTES ════════
  {
    id: 'relance_devis', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Relance devis abandonnés', desc: 'Repère les devis "nouveau" sans réponse depuis 2 à 14 jours et envoie une relance (une seule fois).',
    run: async ({ sb, ago, loggedIds }) => {
      const { data: devis } = await sb.from('devis').select('id,nom,email,created_at').eq('statut', 'nouveau').gte('created_at', ago(14)).lte('created_at', ago(2))
      const deja = await loggedIds('relance_devis')
      let n = 0
      for (const d of devis ?? []) {
        if (deja.has(d.id)) continue
        try { await sendFollowup({ email: d.email, nom: d.nom }); await sb.from('automation_logs').insert({ type: 'relance_devis', payload: { devis_id: d.id, email: d.email } }); n++ } catch { /* skip */ }
      }
      return { count: n, selfLogged: true }
    },
  },
  {
    id: 'devis_relance_2', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Seconde relance devis', desc: 'Relance #2 (une seule fois) pour les devis restés sans suite 15 à 30 jours, déjà relancés une première fois.',
    run: async ({ sb, ago, loggedIds }) => {
      const { data: devis } = await sb.from('devis').select('id,nom,email,created_at').in('statut', ['nouveau', 'contacte']).gte('created_at', ago(30)).lte('created_at', ago(15))
      const [relance1, deja] = [await loggedIds('relance_devis'), await loggedIds('devis_relance_2')]
      let n = 0
      for (const d of devis ?? []) {
        if (deja.has(d.id) || !relance1.has(d.id)) continue // n'envoie la #2 que si la #1 a déjà eu lieu
        try { await sendFollowup({ email: d.email, nom: d.nom }); await sb.from('automation_logs').insert({ type: 'devis_relance_2', payload: { devis_id: d.id } }); n++ } catch { /* skip */ }
      }
      return { count: n, selfLogged: true }
    },
  },
  {
    id: 'devis_auto_perdu', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Archivage devis morts', desc: 'Passe automatiquement en "refusé" les devis "nouveau"/"contacté" inactifs depuis plus de 45 jours.',
    run: async ({ sb, ago }) => {
      const { data: devis } = await sb.from('devis').select('id').in('statut', ['nouveau', 'contacte']).lte('created_at', ago(45))
      let n = 0
      for (const d of devis ?? []) { await sb.from('devis').update({ statut: 'refuse' }).eq('id', d.id); n++ }
      return { count: n, payload: { archives: n } }
    },
  },
  {
    id: 'devis_alerte_nouveau', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Alerte nouveau devis', desc: 'Prévient dès qu\'une nouvelle demande de devis est arrivée dans les dernières 24h (réactivité = conversion).',
    run: async ({ sb, ago, mailAdmin, ranToday }) => {
      if (await ranToday('devis_alerte_nouveau')) return { count: 0 }
      const { data: devis } = await sb.from('devis').select('nom,service,budget,created_at').gte('created_at', ago(1)).order('created_at', { ascending: false })
      if (!devis?.length) return { count: 0 }
      await mailAdmin(`${devis.length} nouvelle(s) demande(s) de devis`, wrap('Nouvelles demandes (24h)', `<ul>${devis.map(d => li(`<b>${d.nom}</b> — ${d.service || 'projet'}${d.budget ? ` (${d.budget})` : ''}`)).join('')}</ul><p>Réponds vite : un prospect recontacté dans l'heure convertit bien mieux.</p>`))
      return { count: devis.length }
    },
  },
  {
    id: 'devis_relance_en_cours', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Relance devis "en cours"', desc: 'Signale les devis "en cours" sans mise à jour depuis 14 jours, à relancer pour ne pas les perdre.',
    run: async ({ sb, ago, mailAdmin, ranToday }) => {
      if (await ranToday('devis_relance_en_cours')) return { count: 0 }
      const { data } = await sb.from('devis').select('nom,updated_at').eq('statut', 'en_cours').lte('updated_at', ago(14))
      if (!data?.length) return { count: 0 }
      await mailAdmin(`${data.length} devis "en cours" à relancer`, wrap('Devis en cours sans nouvelle depuis 14j', `<ul>${data.map(d => li(d.nom)).join('')}</ul>`))
      return { count: data.length }
    },
  },
  {
    id: 'devis_doublon', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Détection doublons devis', desc: 'Repère les demandes en double (même e-mail < 48h) pour éviter les relances redondantes.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('devis').select('email,created_at').gte('created_at', ago(2))
      const counts: Record<string, number> = {}
      for (const d of data ?? []) counts[d.email] = (counts[d.email] || 0) + 1
      const doublons = Object.entries(counts).filter(([, n]) => n > 1)
      return doublons.length ? { count: doublons.length, payload: { doublons: doublons.map(([e, n]) => `${e}×${n}`) } } : { count: 0 }
    },
  },
  {
    id: 'devis_auto_client', onglet: 'Ventes', cible: 'Devis', cadence: 'quotidien',
    label: 'Devis accepté → fiche client', desc: 'Crée automatiquement une fiche client (actif) quand un devis passe en "accepté", s\'il n\'existe pas déjà.',
    run: async ({ sb }) => {
      const { data: devis } = await sb.from('devis').select('nom,email,telephone,service,budget').eq('statut', 'accepte')
      if (!devis?.length) return { count: 0 }
      const { data: clients } = await sb.from('site_clients').select('email')
      const emails = new Set((clients ?? []).map(c => (c.email || '').trim().toLowerCase()))
      let n = 0
      for (const d of devis) {
        const e = (d.email || '').trim().toLowerCase()
        if (!e || emails.has(e)) continue
        await sb.from('site_clients').insert({ nom: d.nom, email: d.email, telephone: d.telephone || '', statut: 'actif', notes: [d.service && `Service : ${d.service}`, d.budget && `Budget : ${d.budget}`].filter(Boolean).join('\n') })
        emails.add(e); n++
      }
      return { count: n, payload: { crees: n } }
    },
  },
  {
    id: 'devis_conversion_hebdo', onglet: 'Ventes', cible: 'Devis', cadence: 'hebdo',
    label: 'Taux de conversion hebdo', desc: 'Chaque lundi : calcule le taux de transformation des devis (acceptés / traités) et l\'archive.',
    run: async ({ sb }) => {
      const { data } = await sb.from('devis').select('statut')
      const acc = (data ?? []).filter(d => d.statut === 'accepte').length
      const traites = (data ?? []).filter(d => d.statut === 'accepte' || d.statut === 'refuse').length
      const taux = traites ? Math.round((acc / traites) * 100) : 0
      return { count: 1, payload: { taux_pct: taux, acceptes: acc, traites } }
    },
  },
  {
    id: 'devis_test_flag', onglet: 'Ventes', cible: 'Devis', cadence: 'hebdo',
    label: 'Repérage devis de test', desc: 'Signale les devis contenant "test" (à nettoyer pour ne pas polluer les stats).',
    run: async ({ sb }) => {
      const { data } = await sb.from('devis').select('id,nom').or('nom.ilike.%test%,email.ilike.%test%')
      return (data?.length) ? { count: data.length, payload: { a_nettoyer: data.length } } : { count: 0 }
    },
  },

  {
    id: 'clients_relance_inactifs', onglet: 'Ventes', cible: 'Clients', cadence: 'hebdo',
    label: 'Clients actifs dormants', desc: 'Signale les clients "actif" sans facture ni commande depuis 90 jours (à recontacter / upsell).',
    run: async ({ sb, ago, mailAdmin }) => {
      const { data: clients } = await sb.from('site_clients').select('nom,email').eq('statut', 'actif')
      if (!clients?.length) return { count: 0 }
      const { data: fa } = await sb.from('factures').select('client_email').gte('created_at', ago(90))
      const { data: cm } = await sb.from('commandes').select('client_email').gte('created_at', ago(90))
      const recents = new Set([...(fa ?? []), ...(cm ?? [])].map(x => (x.client_email || '').trim().toLowerCase()))
      const dormants = clients.filter(c => !recents.has((c.email || '').trim().toLowerCase()))
      if (!dormants.length) return { count: 0 }
      await mailAdmin(`${dormants.length} client(s) actif(s) à recontacter`, wrap('Clients sans activité depuis 90j', `<ul>${dormants.slice(0, 20).map(c => li(c.nom)).join('')}</ul>`))
      return { count: dormants.length }
    },
  },
  {
    id: 'clients_promote', onglet: 'Ventes', cible: 'Clients', cadence: 'quotidien',
    label: 'Prospect → client suggéré', desc: 'Suggère de passer un prospect en "actif" dès qu\'il a un devis accepté.',
    run: async ({ sb }) => {
      const { data: prospects } = await sb.from('site_clients').select('email').eq('statut', 'prospect')
      if (!prospects?.length) return { count: 0 }
      const { data: accs } = await sb.from('devis').select('email').eq('statut', 'accepte')
      const accSet = new Set((accs ?? []).map(d => (d.email || '').trim().toLowerCase()))
      const promo = prospects.filter(p => accSet.has((p.email || '').trim().toLowerCase()))
      return promo.length ? { count: promo.length, payload: { a_promouvoir: promo.length } } : { count: 0 }
    },
  },
  {
    id: 'clients_reactivation', onglet: 'Ventes', cible: 'Clients', cadence: 'mensuel',
    label: 'Win-back clients terminés', desc: 'Chaque mois : liste les clients "terminé" depuis +6 mois à relancer (nouvelle offre, maintenance).',
    run: async ({ sb, ago, mailAdmin }) => {
      const { data } = await sb.from('site_clients').select('nom').eq('statut', 'termine').lte('updated_at', ago(180))
      if (!data?.length) return { count: 0 }
      await mailAdmin(`${data.length} ancien(s) client(s) à réactiver`, wrap('Win-back (clients terminés +6 mois)', `<ul>${data.slice(0, 20).map(c => li(c.nom)).join('')}</ul>`))
      return { count: data.length }
    },
  },
  {
    id: 'clients_doublons', onglet: 'Ventes', cible: 'Clients', cadence: 'hebdo',
    label: 'Doublons clients', desc: 'Détecte les fiches client en double (même e-mail) à fusionner.',
    run: async ({ sb }) => {
      const { data } = await sb.from('site_clients').select('email')
      const counts: Record<string, number> = {}
      for (const c of data ?? []) { const e = (c.email || '').trim().toLowerCase(); if (e) counts[e] = (counts[e] || 0) + 1 }
      const dbl = Object.entries(counts).filter(([, n]) => n > 1)
      return dbl.length ? { count: dbl.length, payload: { doublons: dbl.map(([e]) => e) } } : { count: 0 }
    },
  },
  {
    id: 'clients_incomplets', onglet: 'Ventes', cible: 'Clients', cadence: 'hebdo',
    label: 'Fiches client incomplètes', desc: 'Repère les clients sans téléphone ou sans entreprise (données à compléter).',
    run: async ({ sb }) => {
      const { data } = await sb.from('site_clients').select('id,telephone,entreprise')
      const incomplets = (data ?? []).filter(c => !c.telephone || !c.entreprise).length
      return incomplets ? { count: incomplets, payload: { a_completer: incomplets } } : { count: 0 }
    },
  },
  {
    id: 'clients_digest_hebdo', onglet: 'Ventes', cible: 'Clients', cadence: 'hebdo',
    label: 'Nouveaux clients de la semaine', desc: 'Chaque lundi : récap des fiches client créées cette semaine.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('site_clients').select('id').gte('created_at', ago(7))
      return (data?.length) ? { count: data.length, payload: { nouveaux: data.length } } : { count: 0 }
    },
  },

  {
    id: 'overdue_alert', onglet: 'Ventes', cible: 'Factures', cadence: 'quotidien',
    label: 'Factures impayées → en retard', desc: 'Passe en "en retard" les factures envoyées dont l\'échéance est dépassée.',
    run: async ({ sb, today }) => {
      const { data } = await sb.from('factures').select('id,numero,montant_ttc').eq('statut', 'envoyee').lt('date_echeance', today)
      let n = 0
      for (const f of data ?? []) { await sb.from('factures').update({ statut: 'en_retard' }).eq('id', f.id); await sb.from('automation_logs').insert({ type: 'overdue_alert', payload: { facture_id: f.id, numero: f.numero, montant_ttc: f.montant_ttc } }); n++ }
      return { count: n, selfLogged: true }
    },
  },
  {
    id: 'factures_relance_impayee', onglet: 'Ventes', cible: 'Factures', cadence: 'quotidien',
    label: 'Relance factures en retard', desc: 'Alerte hebdomadaire récapitulant les factures en retard à relancer (montant total dû).',
    run: async ({ sb, mailAdmin, ranToday }) => {
      if (await ranToday('factures_relance_impayee')) return { count: 0 }
      const { data } = await sb.from('factures').select('numero,client_nom,montant_ttc,date_echeance').eq('statut', 'en_retard')
      if (!data?.length) return { count: 0 }
      await sendOverdueAlert(data.map(f => ({ numero: f.numero, client_nom: f.client_nom, montant_ttc: f.montant_ttc, date_echeance: f.date_echeance || '' }))).catch(() => {})
      const total = data.reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
      return { count: data.length, payload: { factures: data.length, du: Math.round(total) } }
    },
  },
  {
    id: 'factures_echeance_proche', onglet: 'Ventes', cible: 'Factures', cadence: 'quotidien',
    label: 'Échéance dans 3 jours', desc: 'Signale les factures envoyées dont l\'échéance tombe dans 3 jours (relance préventive).',
    run: async ({ sb, today, ago, mailAdmin, ranToday }) => {
      if (await ranToday('factures_echeance_proche')) return { count: 0 }
      const dans3 = new Date(Date.now() + 3 * DAY).toISOString().slice(0, 10)
      const { data } = await sb.from('factures').select('numero,client_nom,montant_ttc,date_echeance').eq('statut', 'envoyee').gte('date_echeance', today).lte('date_echeance', dans3)
      if (!data?.length) return { count: 0 }
      await mailAdmin(`${data.length} facture(s) à échéance proche`, wrap('Échéances dans 3 jours', `<ul>${data.map(f => li(`${f.numero} — ${f.client_nom} — ${euro(f.montant_ttc)}`)).join('')}</ul>`))
      return { count: data.length }
    },
  },
  {
    id: 'factures_brouillon_oublie', onglet: 'Ventes', cible: 'Factures', cadence: 'hebdo',
    label: 'Brouillons oubliés', desc: 'Repère les factures en "brouillon" depuis +14 jours (à finaliser ou supprimer).',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('factures').select('numero').eq('statut', 'brouillon').lte('created_at', ago(14))
      return (data?.length) ? { count: data.length, payload: { brouillons: data.length } } : { count: 0 }
    },
  },
  {
    id: 'factures_encaissement_hebdo', onglet: 'Ventes', cible: 'Factures', cadence: 'hebdo',
    label: 'Encaissements de la semaine', desc: 'Chaque lundi : total des factures payées sur les 7 derniers jours.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('factures').select('montant_ttc').eq('statut', 'payee').gte('created_at', ago(7))
      const total = (data ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
      return total > 0 ? { count: 1, payload: { encaisse: Math.round(total), factures: data?.length ?? 0 } } : { count: 0 }
    },
  },
  {
    id: 'factures_tva_seuil', onglet: 'Ventes', cible: 'Factures', cadence: 'mensuel',
    label: 'Seuil de franchise TVA', desc: 'Surveille le CA annuel vs le seuil de franchise en base de TVA et alerte à 80 % (≈ 39 100 € prestations).',
    run: async ({ sb, now, mailAdmin }) => {
      const debutAnnee = new Date(now.getFullYear(), 0, 1).toISOString()
      const [{ data: fa }, { data: cm }] = await Promise.all([
        sb.from('factures').select('montant_ttc').eq('statut', 'payee').gte('created_at', debutAnnee),
        sb.from('commandes').select('montant').eq('statut', 'paye').gte('created_at', debutAnnee),
      ])
      const ca = (fa ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0) + (cm ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      const SEUIL = 39100
      if (ca < SEUIL * 0.8) return { count: 0 }
      await mailAdmin('⚠️ Tu approches le seuil de franchise TVA', wrap('Seuil de franchise TVA', `<p>CA encaissé cette année : <b>${euro(ca)}</b> sur un seuil de ${euro(SEUIL)}.</p><p>Au-delà, tu deviens redevable de la TVA. Anticipe avec ton comptable.</p>`))
      return { count: 1, payload: { ca_annee: Math.round(ca), seuil: SEUIL } }
    },
  },

  {
    id: 'commandes_client_auto', onglet: 'Ventes', cible: 'Commandes', cadence: 'quotidien',
    label: 'Commande payée → fiche client', desc: 'Crée une fiche client (actif) à partir des commandes Stripe payées, si l\'e-mail n\'existe pas déjà.',
    run: async ({ sb }) => {
      const { data: cmd } = await sb.from('commandes').select('client_nom,client_email,service').eq('statut', 'paye')
      if (!cmd?.length) return { count: 0 }
      const { data: clients } = await sb.from('site_clients').select('email')
      const emails = new Set((clients ?? []).map(c => (c.email || '').trim().toLowerCase()))
      let n = 0
      for (const c of cmd) {
        const e = (c.client_email || '').trim().toLowerCase()
        if (!e || emails.has(e)) continue
        await sb.from('site_clients').insert({ nom: c.client_nom || c.client_email, email: c.client_email, statut: 'actif', notes: c.service ? `Achat : ${c.service}` : '' })
        emails.add(e); n++
      }
      return { count: n, payload: { crees: n } }
    },
  },
  {
    id: 'commandes_digest', onglet: 'Ventes', cible: 'Commandes', cadence: 'quotidien',
    label: 'Alerte nouvelle vente', desc: 'Prévient dès qu\'une commande Stripe a été payée dans les dernières 24h.',
    run: async ({ sb, ago, mailAdmin, ranToday }) => {
      if (await ranToday('commandes_digest')) return { count: 0 }
      const { data } = await sb.from('commandes').select('client_nom,service,montant').eq('statut', 'paye').gte('created_at', ago(1))
      if (!data?.length) return { count: 0 }
      const total = data.reduce((s, c) => s + Number(c.montant || 0), 0)
      await mailAdmin(`💳 ${data.length} vente(s) — ${euro(total)}`, wrap('Nouvelles ventes (24h)', `<ul>${data.map(c => li(`${c.client_nom || '—'} — ${c.service || ''} — ${euro(c.montant)}`)).join('')}</ul>`))
      return { count: data.length, payload: { ventes: data.length, total: Math.round(total) } }
    },
  },
  {
    id: 'commandes_facture_rappel', onglet: 'Ventes', cible: 'Commandes', cadence: 'hebdo',
    label: 'Commande sans facture', desc: 'Signale les commandes payées sans facture associée (obligation : émettre une facture).',
    run: async ({ sb }) => {
      const { data: cmd } = await sb.from('commandes').select('client_email').eq('statut', 'paye')
      if (!cmd?.length) return { count: 0 }
      const { data: fa } = await sb.from('factures').select('client_email')
      const factEmails = new Set((fa ?? []).map(f => (f.client_email || '').trim().toLowerCase()))
      const sansFacture = (cmd).filter(c => !factEmails.has((c.client_email || '').trim().toLowerCase())).length
      return sansFacture ? { count: sansFacture, payload: { a_facturer: sansFacture } } : { count: 0 }
    },
  },
  {
    id: 'commandes_panier_abandonne', onglet: 'Ventes', cible: 'Commandes', cadence: 'quotidien',
    label: 'Paiements en attente', desc: 'Repère les commandes restées "en attente" depuis +1 jour (paiement non finalisé).',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('commandes').select('id').eq('statut', 'en_attente').lte('created_at', ago(1))
      return (data?.length) ? { count: data.length, payload: { en_attente: data.length } } : { count: 0 }
    },
  },
  {
    id: 'commandes_hebdo', onglet: 'Ventes', cible: 'Commandes', cadence: 'hebdo',
    label: 'Ventes de la semaine', desc: 'Chaque lundi : nombre de commandes et CA Stripe des 7 derniers jours.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('commandes').select('montant').eq('statut', 'paye').gte('created_at', ago(7))
      const total = (data ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
      return total > 0 ? { count: 1, payload: { ventes: data?.length ?? 0, ca: Math.round(total) } } : { count: 0 }
    },
  },

  {
    id: 'services_top_hebdo', onglet: 'Ventes', cible: 'Services & KPI', cadence: 'hebdo',
    label: 'Service le plus vendu', desc: 'Chaque lundi : identifie le service qui a généré le plus de CA cette semaine.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('commandes').select('service,montant').eq('statut', 'paye').gte('created_at', ago(7))
      if (!data?.length) return { count: 0 }
      const byService: Record<string, number> = {}
      for (const c of data) byService[c.service || '—'] = (byService[c.service || '—'] || 0) + Number(c.montant || 0)
      const top = Object.entries(byService).sort((a, b) => b[1] - a[1])[0]
      return { count: 1, payload: { top: top[0], ca: Math.round(top[1]) } }
    },
  },
  {
    id: 'services_inactifs', onglet: 'Ventes', cible: 'Services & KPI', cadence: 'mensuel',
    label: 'Services sans vente', desc: 'Chaque mois : liste les services actifs n\'ayant généré aucune vente (à promouvoir ou retirer).',
    run: async ({ sb, ago }) => {
      const { data: svc } = await sb.from('site_services').select('nom').eq('actif', true)
      if (!svc?.length) return { count: 0 }
      const { data: cmd } = await sb.from('commandes').select('service').eq('statut', 'paye').gte('created_at', ago(90))
      const vendus = new Set((cmd ?? []).map(c => c.service))
      const inactifs = svc.filter(s => !vendus.has(s.nom)).map(s => s.nom)
      return inactifs.length ? { count: inactifs.length, payload: { inactifs } } : { count: 0 }
    },
  },
  {
    id: 'services_sans_stripe', onglet: 'Ventes', cible: 'Services & KPI', cadence: 'mensuel',
    label: 'Services sans lien d\'achat', desc: 'Repère les services actifs sans lien Stripe (impossible d\'acheter en ligne).',
    run: async ({ sb }) => {
      const { data } = await sb.from('site_services').select('nom,stripe_link').eq('actif', true)
      const sans = (data ?? []).filter(s => !s.stripe_link).map(s => s.nom)
      return sans.length ? { count: sans.length, payload: { sans_lien: sans } } : { count: 0 }
    },
  },

  // ════════ MARKETING ════════
  {
    id: 'articles_index_publication', onglet: 'Marketing', cible: 'Articles', cadence: 'quotidien',
    label: 'Indexation à la publication', desc: 'Quand un article programmé devient public (date du jour), notifie Google/Bing (IndexNow) pour une indexation rapide.',
    run: async ({ sb, today, loggedIds, indexNow }) => {
      const { data } = await sb.from('articles').select('slug').eq('publie', true).eq('date_pub', today)
      const deja = await loggedIds('articles_index_publication')
      let n = 0
      for (const a of data ?? []) {
        if (deja.has(a.slug)) continue
        await indexNow(`https://vivesmedia.com/blog/${a.slug}`)
        await sb.from('automation_logs').insert({ type: 'articles_index_publication', payload: { slug: a.slug } }); n++
      }
      return { count: n, selfLogged: true }
    },
  },
  {
    id: 'articles_planning_vide', onglet: 'Marketing', cible: 'Articles', cadence: 'hebdo',
    label: 'Pipeline éditorial vide', desc: 'Alerte si moins de 2 articles sont programmés à l\'avance (pour ne jamais rompre le rythme SEO).',
    run: async ({ sb, today, mailAdmin }) => {
      const { data } = await sb.from('articles').select('id').gt('date_pub', today)
      const n = data?.length ?? 0
      if (n >= 2) return { count: 0 }
      await mailAdmin('Pipeline blog presque vide', wrap('Plus que ' + n + ' article(s) programmé(s)', '<p>Programme de nouveaux articles pour garder ton rythme de publication (bon pour le SEO).</p>'))
      return { count: 1, payload: { programmes: n } }
    },
  },
  {
    id: 'articles_perf_hebdo', onglet: 'Marketing', cible: 'Articles', cadence: 'hebdo',
    label: 'Performance SEO des articles', desc: 'Chaque lundi : récupère les clics/impressions Search Console des articles de blog.',
    run: async () => {
      try {
        const { getGscPages } = await import('@/lib/google-data')
        const pages = await getGscPages(200)
        const blog = (pages as { url?: string; clicks?: number; impressions?: number }[]).filter(p => (p.url || '').includes('/blog/'))
        const clics = blog.reduce((s, p) => s + (p.clicks || 0), 0)
        const impr = blog.reduce((s, p) => s + (p.impressions || 0), 0)
        return (clics || impr) ? { count: 1, payload: { articles_indexes: blog.length, clics, impressions: impr } } : { count: 0 }
      } catch { return { count: 0 } }
    },
  },
  {
    id: 'articles_rappel_redaction', onglet: 'Marketing', cible: 'Articles', cadence: 'hebdo',
    label: 'Rappel de rédaction', desc: 'Rappelle d\'écrire si aucun article n\'a été publié depuis 14 jours.',
    run: async ({ sb, ago, mailAdmin }) => {
      const { data } = await sb.from('articles').select('id').eq('publie', true).gte('date_pub', ago(14))
      if ((data?.length ?? 0) > 0) return { count: 0 }
      await mailAdmin('Pas d\'article depuis 14 jours', wrap('Rythme éditorial', '<p>Aucun article publié depuis 2 semaines. Un nouvel article = du carburant SEO + de la matière pour une campagne.</p>'))
      return { count: 1 }
    },
  },

  {
    id: 'real_lien_mort', onglet: 'Marketing', cible: 'Réalisations', cadence: 'hebdo',
    label: 'Vérif liens des réalisations', desc: 'Chaque lundi : teste que les sites des réalisations publiées répondent (alerte si l\'un est en panne).',
    run: async ({ sb, mailAdmin }) => {
      const { data } = await sb.from('site_realisations').select('name,live_url').eq('publie', true)
      const morts: string[] = []
      for (const r of data ?? []) {
        if (!r.live_url) continue
        try { const res = await fetch(r.live_url, { method: 'HEAD' }); if (!res.ok) morts.push(`${r.name} (${res.status})`) }
        catch { morts.push(`${r.name} (injoignable)`) }
      }
      if (!morts.length) return { count: 0 }
      await mailAdmin('⚠️ Réalisation(s) en panne', wrap('Sites de réalisations à vérifier', `<ul>${morts.map(li).join('')}</ul>`))
      return { count: morts.length, payload: { morts } }
    },
  },
  {
    id: 'real_sans_image', onglet: 'Marketing', cible: 'Réalisations', cadence: 'hebdo',
    label: 'Réalisations sans visuel', desc: 'Repère les réalisations publiées sans image principale (mauvais rendu portfolio + OG).',
    run: async ({ sb }) => {
      const { data } = await sb.from('site_realisations').select('name,hero_image').eq('publie', true)
      const sans = (data ?? []).filter(r => !r.hero_image).map(r => r.name)
      return sans.length ? { count: sans.length, payload: { sans_image: sans } } : { count: 0 }
    },
  },
  {
    id: 'real_index_nouvelle', onglet: 'Marketing', cible: 'Réalisations', cadence: 'quotidien',
    label: 'Indexation nouvelle réalisation', desc: 'Notifie les moteurs (IndexNow) quand une réalisation est publiée, pour l\'indexer vite.',
    run: async ({ sb, ago, loggedIds, indexNow }) => {
      const { data } = await sb.from('site_realisations').select('slug,created_at').eq('publie', true).gte('created_at', ago(2))
      const deja = await loggedIds('real_index_nouvelle')
      let n = 0
      for (const r of data ?? []) {
        if (deja.has(r.slug)) continue
        await indexNow(`https://vivesmedia.com/realisations/${r.slug}`)
        await sb.from('automation_logs').insert({ type: 'real_index_nouvelle', payload: { slug: r.slug } }); n++
      }
      return { count: n, selfLogged: true }
    },
  },

  {
    id: 'temoignages_demande_auto', onglet: 'Marketing', cible: 'Témoignages', cadence: 'hebdo',
    label: 'Demande d\'avis automatique', desc: 'Demande un avis aux clients passés "terminé" récemment (preuve sociale = conversion).',
    run: async ({ sb, ago, loggedIds }) => {
      const { data } = await sb.from('site_clients').select('id,nom,email').eq('statut', 'termine').gte('updated_at', ago(14))
      const deja = await loggedIds('temoignages_demande_auto')
      let n = 0
      for (const c of data ?? []) {
        if (deja.has(c.id) || !c.email) continue
        try { await sendTestimonialRequest({ email: c.email, nom: c.nom }); await sb.from('automation_logs').insert({ type: 'temoignages_demande_auto', payload: { client_id: c.id } }); n++ } catch { /* skip */ }
      }
      return { count: n, selfLogged: true }
    },
  },
  {
    id: 'temoignages_digest', onglet: 'Marketing', cible: 'Témoignages', cadence: 'mensuel',
    label: 'Suivi des témoignages', desc: 'Chaque mois : nombre de témoignages actifs affichés sur le site (objectif : en avoir toujours plus).',
    run: async ({ sb }) => {
      const { data } = await sb.from('temoignages').select('id').eq('actif', true)
      return { count: 1, payload: { actifs: data?.length ?? 0 } }
    },
  },

  {
    id: 'newsletter_milestone', onglet: 'Marketing', cible: 'Newsletter', cadence: 'quotidien',
    label: 'Cap d\'abonnés franchi', desc: 'Célèbre chaque palier d\'abonnés franchi (25, 50, 100, 250, 500…).',
    run: async ({ sb, mailAdmin }) => {
      const { data } = await sb.from('newsletter').select('id').eq('actif', true)
      const n = data?.length ?? 0
      const paliers = [25, 50, 100, 250, 500, 1000]
      const atteint = paliers.filter(p => n >= p).pop()
      if (!atteint) return { count: 0 }
      const { data: deja } = await sb.from('automation_logs').select('id').eq('type', 'newsletter_milestone').filter('payload->>palier', 'eq', String(atteint)).limit(1)
      if (deja?.length) return { count: 0 }
      await mailAdmin(`🎉 ${atteint} abonnés newsletter !`, wrap('Nouveau palier', `<p>Ta newsletter dépasse les <b>${atteint} abonnés</b>. Pense à les remercier avec un contenu exclusif.</p>`))
      return { count: 1, payload: { palier: atteint, total: n }, selfLogged: false }
    },
  },
  {
    id: 'newsletter_digest_hebdo', onglet: 'Marketing', cible: 'Newsletter', cadence: 'hebdo',
    label: 'Nouveaux abonnés de la semaine', desc: 'Chaque lundi : nombre de nouveaux inscrits à la newsletter sur 7 jours.',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('newsletter').select('id').gte('date_inscription', ago(7))
      return (data?.length) ? { count: data.length, payload: { nouveaux: data.length } } : { count: 0 }
    },
  },
  {
    id: 'newsletter_reengagement', onglet: 'Marketing', cible: 'Newsletter', cadence: 'mensuel',
    label: 'Désabonnés à analyser', desc: 'Chaque mois : nombre de désabonnés (signal sur la qualité/fréquence des envois).',
    run: async ({ sb }) => {
      const { data } = await sb.from('newsletter').select('actif')
      const off = (data ?? []).filter(s => !s.actif).length
      return off ? { count: off, payload: { desabonnes: off } } : { count: 0 }
    },
  },

  {
    id: 'campagnes_rappel_mensuel', onglet: 'Marketing', cible: 'Campagnes', cadence: 'mensuel',
    label: 'Rappel campagne mensuelle', desc: 'Rappelle d\'envoyer une campagne si aucune n\'est partie ce mois-ci.',
    run: async ({ sb, now, mailAdmin }) => {
      const moisDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { data } = await sb.from('automation_logs').select('id').eq('type', 'campagne').gte('created_at', moisDebut).limit(1)
      if (data?.length) return { count: 0 }
      await mailAdmin('Pense à ta campagne du mois', wrap('Newsletter mensuelle', '<p>Aucune campagne envoyée ce mois-ci. Une nouveauté, un article utile ou une offre = reste dans la tête de tes prospects.</p>'))
      return { count: 1 }
    },
  },
  {
    id: 'campagnes_ouvertures_hebdo', onglet: 'Marketing', cible: 'Campagnes', cadence: 'hebdo',
    label: 'Bilan ouvertures hebdo', desc: 'Chaque lundi : total des ouvertures d\'e-mails de campagne sur 7 jours (via webhook Resend).',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('automation_logs').select('id').eq('type', 'email_open').gte('created_at', ago(7))
      return (data?.length) ? { count: data.length, payload: { ouvertures: data.length } } : { count: 0 }
    },
  },

  // ════════ HUB CLIENTS ════════
  {
    id: 'formations_brouillon_rappel', onglet: 'Hub Clients', cible: 'Formations', cadence: 'mensuel',
    label: 'Formations en brouillon', desc: 'Chaque mois : rappelle les cours non publiés (à finaliser pour l\'espace client).',
    run: async ({ sb }) => {
      const { data } = await sb.from('courses').select('slug').eq('published', false)
      return (data?.length) ? { count: data.length, payload: { brouillons: data.length } } : { count: 0 }
    },
  },
  {
    id: 'formations_digest', onglet: 'Hub Clients', cible: 'Formations', cadence: 'mensuel',
    label: 'Suivi du catalogue de formations', desc: 'Chaque mois : nombre de formations publiées dans l\'espace client.',
    run: async ({ sb }) => {
      const { data } = await sb.from('courses').select('slug').eq('published', true)
      return { count: 1, payload: { publiees: data?.length ?? 0 } }
    },
  },

  // ════════ OUTILS ════════
  {
    id: 'agenda_rappel_jour', onglet: 'Outils', cible: 'Agenda', cadence: 'quotidien',
    label: 'Rappel RDV du jour', desc: 'Chaque matin : e-mail récapitulant tes rendez-vous Google Calendar du jour (si l\'agenda est connecté).',
    run: async ({ mailAdmin, ranToday }) => {
      if (await ranToday('agenda_rappel_jour')) return { count: 0 }
      try {
        const { getUpcomingEvents } = await import('@/lib/google-data')
        const r = await getUpcomingEvents(10)
        if (!r.ok || !r.events.length) return { count: 0 }
        const today = new Date().toISOString().slice(0, 10)
        const dujour = r.events.filter(e => (e.start || '').slice(0, 10) === today)
        if (!dujour.length) return { count: 0 }
        await mailAdmin(`${dujour.length} RDV aujourd'hui`, wrap('Tes rendez-vous du jour', `<ul>${dujour.map(e => li(`${(e.start || '').slice(11, 16)} — ${e.title}`)).join('')}</ul>`))
        return { count: dujour.length }
      } catch { return { count: 0 } }
    },
  },
  {
    id: 'auto_purge_logs', onglet: 'Outils', cible: 'Automatisations', cadence: 'hebdo',
    label: 'Purge du journal', desc: 'Chaque lundi : supprime les entrées du journal de plus de 180 jours (garde la base légère et rapide).',
    run: async ({ sb, ago }) => {
      const { data } = await sb.from('automation_logs').select('id').lte('created_at', ago(180)).limit(500)
      if (!data?.length) return { count: 0 }
      await sb.from('automation_logs').delete().lte('created_at', ago(180))
      return { count: data.length, payload: { purges: data.length } }
    },
  },
  {
    id: 'auto_heartbeat', onglet: 'Outils', cible: 'Automatisations', cadence: 'quotidien',
    label: 'Battement de cœur (santé)', desc: 'Confirme chaque jour que le moteur d\'automatisations tourne bien (preuve de bon fonctionnement).',
    run: async ({ ranToday }) => {
      if (await ranToday('auto_heartbeat')) return { count: 0 }
      return { count: 1, payload: { ok: true } }
    },
  },
]

// Libellés lisibles pour le journal (id technique → nom).
export const AUTOMATION_LABELS: Record<string, string> = Object.fromEntries(AUTOMATIONS.map(a => [a.id, a.label]))

// ── Runner ──────────────────────────────────────────────────────────────────
export async function runDueAutomations(force?: string): Promise<Record<string, number>> {
  const sb = createServiceClient()
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const dow = now.getUTCDay() // 0=dim, 1=lun
  const dom = now.getUTCDate()

  const ago = (days: number) => new Date(now.getTime() - days * DAY).toISOString()
  const mailAdmin = async (subject: string, html: string) => {
    const key = process.env.RESEND_API_KEY
    if (!key) return
    await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'vivesmedia.com <contact@vivesmedia.com>', to: 'berangervives@gmail.com', subject: `[vivesmedia] ${subject}`, html }),
    }).catch(() => {})
  }
  const ranToday = async (id: string) => {
    const { data } = await sb.from('automation_logs').select('id').eq('type', id).gte('created_at', `${today}T00:00:00Z`).limit(1)
    return !!(data && data.length)
  }
  const loggedIds = async (id: string) => {
    const { data } = await sb.from('automation_logs').select('payload').eq('type', id)
    const s = new Set<string>()
    for (const l of data ?? []) {
      const p = l.payload as { devis_id?: string; client_id?: string; slug?: string } | null
      const v = p?.devis_id || p?.client_id || p?.slug
      if (v) s.add(v)
    }
    return s
  }
  const indexNow = async (url: string) => {
    const key = process.env.INDEXNOW_KEY
    if (!key) return
    await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}`).catch(() => {})
  }

  const ctx: AutoCtx = { sb, now, today, ago, mailAdmin, ranToday, loggedIds, indexNow }
  const result: Record<string, number> = {}

  for (const a of AUTOMATIONS) {
    const due = force ? a.id === force
      : a.cadence === 'quotidien' || (a.cadence === 'hebdo' && dow === 1) || (a.cadence === 'mensuel' && dom === 1)
    if (!due) continue
    try {
      const r = await a.run(ctx)
      if (r && (r.count > 0)) {
        if (!r.selfLogged) await sb.from('automation_logs').insert({ type: a.id, payload: r.payload ?? { count: r.count } })
        result[a.id] = r.count
      }
    } catch (e) {
      console.error('[automations]', a.id, e)
    }
  }
  return result
}
