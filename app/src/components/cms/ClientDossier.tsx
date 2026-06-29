'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { crmService, clientsService, type ClientDossier as Dossier } from '@/services/supabase.service'
import type { Client } from '@/types'
import { FileText, Receipt, ShoppingBag, Euro, Mail, Phone, Building2, ArrowLeft, Globe, Send, Copy, Check, UserCheck, MapPin, MessageSquare, MessageCircle, Eye, MousePointerClick, Activity, Gauge, PhoneCall, Trash2, Clock, type LucideIcon } from 'lucide-react'

const ORANGE = '#F4521E'
// Métadonnées d'affichage de la timeline de suivi
const ACT_META: Record<string, { label: string; icon: LucideIcon; bg: string; fg: string }> = {
  prospect_email: { label: 'Email envoyé', icon: Send, bg: '#FFF1EC', fg: '#F4521E' },
  email_open: { label: 'Email ouvert', icon: Eye, bg: '#ECFDF5', fg: '#16A34A' },
  email_click: { label: 'Lien cliqué', icon: MousePointerClick, bg: '#EFF6FF', fg: '#2563EB' },
  email_bounce: { label: 'Email rejeté', icon: Mail, bg: '#FEE2E2', fg: '#DC2626' },
  prospect_call: { label: 'Appel passé', icon: PhoneCall, bg: '#F1F5F9', fg: '#475569' },
  prospect_sms: { label: 'SMS envoyé', icon: MessageSquare, bg: '#F1F5F9', fg: '#475569' },
  prospect_whatsapp: { label: 'WhatsApp', icon: MessageCircle, bg: '#DCFCE7', fg: '#16A34A' },
  default: { label: 'Action', icon: Activity, bg: '#F3F4F6', fg: '#6B7280' },
}
const euro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

const DEVIS_COLORS: Record<string, string> = { nouveau: 'bg-orange-100 text-orange-700', contacte: 'bg-blue-100 text-blue-700', en_cours: 'bg-violet-100 text-violet-700', accepte: 'bg-green-100 text-green-700', refuse: 'bg-gray-100 text-gray-500' }
const FACT_COLORS: Record<string, string> = { brouillon: 'bg-gray-100 text-gray-500', envoyee: 'bg-blue-100 text-blue-700', payee: 'bg-green-100 text-green-700', en_retard: 'bg-red-100 text-red-600', annulee: 'bg-gray-100 text-gray-400' }
const CMD_COLORS: Record<string, string> = { en_attente: 'bg-orange-100 text-orange-700', paye: 'bg-green-100 text-green-700', rembourse: 'bg-blue-100 text-blue-700', annule: 'bg-gray-100 text-gray-500' }
const STATUT_COLORS: Record<string, string> = { prospect: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', pause: 'bg-orange-100 text-orange-700', termine: 'bg-gray-100 text-gray-500' }
const STATUTS: Client['statut'][] = ['prospect', 'actif', 'pause', 'termine']

function Badge({ value, map }: { value: string; map: Record<string, string> }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[value] || 'bg-gray-100 text-gray-500'}`}>{value}</span>
}

/** Extrait commune + site web depuis les notes (issues du sourcing / enrichissement). */
function parseNotes(notes?: string) {
  const n = notes || ''
  const commune = (n.match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''
  let site = (n.match(/https?:\/\/[^\s·]+/) || [])[0] || (n.match(/site\s+([a-z0-9.-]+\.[a-z]{2,})/i) || [])[1] || ''
  if (site && !site.startsWith('http')) site = 'https://' + site
  return { commune, site }
}

// Classification téléphone (FR) : 06/07 = mobile (SMS possible), sinon fixe.
const normPhone = (t?: string) => (t || '').replace(/[\s.\-]/g, '').replace(/^\+33/, '0')
const isMobile = (t?: string) => /^0[67]/.test(normPhone(t))
const phoneType = (t?: string) => !t ? '' : isMobile(t) ? 'mobile' : 'fixe'
// Classification email : webmail grand public (perso) vs domaine propre (pro).
const WEBMAIL = ['gmail.', 'orange.fr', 'free.fr', 'wanadoo.fr', 'hotmail.', 'outlook.', 'live.', 'yahoo.', 'sfr.fr', 'laposte.net', 'icloud.', 'gmx.', 'aol.', 'bbox.fr', 'neuf.fr', 'numericable']
const emailType = (e?: string) => { if (!e) return ''; const d = (e.split('@')[1] || '').toLowerCase(); return WEBMAIL.some(w => d.includes(w)) ? 'perso' : 'pro' }
// Téléphones additionnels stockés dans les notes (« Fixe: … · Mobile: … »)
function parsePhones(notes?: string) {
  const n = notes || ''
  return { fixe: (n.match(/Fixe[:\s]+(0[1-9](?:[\s.\-]?\d{2}){4})/i) || [])[1] || '', mobile: (n.match(/Mobile[:\s]+(0[67](?:[\s.\-]?\d{2}){4})/i) || [])[1] || '' }
}

/** Modèles d'email personnalisés par prospect (B2B, conformes : identité + objet métier). */
// Modèles « cold email » suivant les bonnes pratiques 2025/26 : court, centré sur
// le prospect, objet personnalisé sans mots spam, UN seul CTA doux (une question),
// preuve légère, texte simple, identité claire. Personnalisé par entreprise/secteur/ville.
// Nettoie un nom d'entreprise issu de l'open data (MAJUSCULES + forme juridique + mentions
// entre parenthèses) pour un usage naturel en email.
// Ex. « SARL MENUISERIE DURAND (EI) » → « Menuiserie Durand ».
const LEGAL_FORMS = /\b(SARLU|SARL|SASU|SAS|EURL|EIRL|EI|SNC|SCIC|SCI|SCM|SELARL|SELAS|SCOP|GAEC|SCEA|SA|ETS|ETABLISSEMENTS?|MICRO[\s-]?ENTREPRISE|AUTO[\s-]?ENTREPRENEUR)\b\.?/gi
const SMALL_WORDS = new Set(['de', 'du', 'des', 'le', 'la', 'les', 'et', 'd', 'l', 'à', 'au', 'aux', 'en', 'sur'])

function cleanCompany(raw: string): string {
  let s = (raw || '').trim()
  if (!s) return ''
  s = s.replace(/\([^)]*\)/g, ' ').replace(LEGAL_FORMS, ' ').replace(/\s{2,}/g, ' ').trim()
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '')
  // Open data tout en MAJUSCULES → Title Case (en gardant les mots de liaison en minuscule)
  if (letters && letters === letters.toUpperCase()) {
    s = s.toLowerCase().split(/\s+/).map((w, i) =>
      i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ')
  }
  return s.trim()
}

// Prénom du dirigeant pour personnaliser l'accroche (heuristique INSEE : le prénom
// n'est pas en MAJUSCULES, contrairement au NOM). Retourne '' si rien d'exploitable.
function firstNameOf(dirigeant: string): string {
  const parts = (dirigeant || '').replace(/\b(M\.?|Mme\.?|Mr\.?|Monsieur|Madame|Dr\.?)\b/gi, '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const pick = parts.find(p => p && p !== p.toUpperCase()) || parts[parts.length - 1]
  if (pick.length < 2) return ''
  return pick.charAt(0).toUpperCase() + pick.slice(1).toLowerCase()
}

// Email personnalisé stocké dans les notes (marqueur). S'il existe, il remplace le 1er contact générique.
function parseCustomEmail(notes?: string): { subject: string; body: string } | null {
  const n = notes || ''
  const MARK = '==== EMAIL PERSONNALISÉ ===='
  const i = n.indexOf(MARK)
  if (i === -1) return null
  const block = n.slice(i + MARK.length).trim()
  const m = block.match(/^Objet\s*:\s*(.+)$/m)
  if (!m) return null
  const subject = m[1].trim()
  const body = block.slice(block.indexOf(m[0]) + m[0].length).trim()
  if (!body) return null
  return { subject, body }
}

function templates(c: Client, commune: string) {
  const ent = cleanCompany(c.entreprise || c.nom) || 'votre entreprise'
  const lieu = commune ? ` à ${commune}` : ''
  const info = parseInfo(c.notes)
  const prenom = firstNameOf(info.dirigeant)
  const hello = prenom ? `Bonjour ${prenom},` : 'Bonjour,'
  const sign = '\n\nBonne journée,\nBéranger Vives\nvivesmedia.com'
  const custom = parseCustomEmail(c.notes)
  const metier = (c.secteur || '').toLowerCase().trim()
  const aSite = !!info.site && !info.noSite
  const caTxt = info.ca ? ` (~${info.ca} € de chiffre d'affaires)` : ''
  // 1er contact adapté aux dernières données : site/pas de site + CA
  const firstBody = aSite
    ? `${hello}\n\nJe suis tombé sur ${ent}${lieu} et j'ai regardé votre site. Le souci : il n'est pas vraiment pensé pour le mobile, alors que près de 3 clients sur 4 vous cherchent depuis leur téléphone. Une partie de ces visiteurs repart${caTxt ? `, et sur un chiffre d'affaires comme le vôtre${caTxt} ça représente vite plusieurs milliers d'euros par an` : ''}.\n\nJe refais des sites pour les pros${lieu} (vivesmedia.com), pensés mobile + référencement local, en abonnement (dès 89 €/mois, tout compris) et prêts en moins d'une semaine.\n\nJe peux vous montrer à quoi ressemblerait le nouveau site de ${ent} ? 10 min, sans engagement.${sign}`
    : `${hello}\n\nJe suis tombé sur ${ent}${lieu}… mais pas sur votre site. Aujourd'hui, près de 3 clients sur 4 cherchent ${metier ? `un ${metier}` : 'un pro'}${lieu} depuis leur téléphone — sans site ni fiche Google à jour, ce sont autant de clients qui vont chez un concurrent visible en ligne.\n\nJe crée des sites pour les pros${lieu} (vivesmedia.com) : site + référencement local + fiche Google, en abonnement (dès 89 €/mois, tout compris) et prêt en moins d'une semaine.\n\nÇa vous intéresse que je vous montre ce que ça donnerait pour ${ent} ? 10 min, sans engagement.${sign}`
  return {
    contact: custom ? {
      label: '1er contact (perso)',
      subject: custom.subject,
      body: custom.body,
    } : {
      label: '1er contact',
      subject: aSite ? `Le site de ${ent} sur mobile` : `${ent} sur Google`,
      body: firstBody,
    },
    relance: {
      label: 'Relance',
      subject: `Re : ${ent} sur Google`,
      body: `${hello}\n\nJe me permets un petit rappel au sujet de mon précédent message — aucun souci si ce n'est pas le moment.\n\nSi gagner en visibilité pour ${ent} vous intéresse, répondez-moi simplement « oui » et je vous envoie mes idées.${sign}`,
    },
    rdv: {
      label: 'Proposer un RDV',
      subject: `15 min pour ${ent} ?`,
      body: `${hello}\n\nPlutôt que de longs emails, je vous propose un échange de 15 minutes : je vous montre 2 ou 3 choses simples pour que ${ent} attire plus de clients via son site et Google.\n\nIndiquez-moi un créneau qui vous arrange, je m'adapte.${sign}`,
    },
    audit: {
      label: 'Audit offert',
      subject: `2 idées pour ${ent}`,
      body: `${hello}\n\nJ'ai regardé la présence en ligne de ${ent} et quelques détails simples pourraient vous amener plus de clients${lieu}.\n\nSi le sujet vous parle, je vous montre tout ça en 10 minutes, sans engagement.${sign}`,
    },
    gmb: {
      label: 'Google / avis',
      subject: `${ent} sur Google`,
      body: `${hello}\n\nQuand quelqu'un cherche votre métier${lieu} sur Google, ce sont souvent la fiche Google et les avis qui décident où il va. J'aide les pros à mieux y apparaître et à transformer ces recherches en clients.\n\nEst-ce un sujet pour ${ent} en ce moment ?${sign}`,
    },
    offre: {
      label: 'Place dispo',
      subject: `Une place ce mois-ci pour ${ent}`,
      body: `${hello}\n\nJe prends seulement 1 à 2 nouveaux projets par mois, et il me reste une place. Si créer ou refaire le site de ${ent} fait partie de vos projets, c'est le bon moment pour en parler.\n\nUn créneau de 10 minutes cette semaine ?${sign}`,
    },
  }
}

// Conseils cold email (affichés dans la fiche)
const COLD_TIPS = 'Court (50-90 mots) · parle d\'EUX d\'abord · 1 seule question · pas de « gratuit/promo » dans l\'objet · relance après 3-4 jours (le mardi/mercredi 10h-11h convertit le mieux).'

// Extrait toutes les infos open data stockées dans les notes.
function parseInfo(notes?: string) {
  const n = notes || ''
  const g = (re: RegExp) => (n.match(re) || [])[1] || ''
  return {
    commune: g(/·\s*([^·]+?)\s*\(8\d{4}\)/), cp: g(/\((8\d{4})\)/), naf: g(/NAF\s+([0-9.A-Z]+)/i),
    an: g(/créé\s+(\d{4})/i), eff: g(/effectif\s+(\S+?)(?:\s·|$)/i), siren: g(/SIREN\s+(\d{9})/i),
    dirigeant: g(/dirigeant\s+([^·]+?)(?:\s·|$)/i) || g(/·\s*dir\.\s*([^·\]]+?)(?:\s*\(|·|\])/i),
    score: g(/score\s+(\d+)\/10/i),
    // données enrichies (API gouv) : CA + résultat net + présence de site
    caYear: g(/CA\s+(\d{4})\s/i), ca: g(/CA\s+\d{4}\s+([\d\s.  ]+?)\s*€/i).replace(/[\s  ]/g, ' ').trim(),
    site: g(/·\s*ENRICHI[^·]*site\s+(https?:\/\/\S+)/i) || g(/site\s+(https?:\/\/[^\s·\]]+)/i),
    noSite: /site=aucun|site=invalide/i.test(n),
  }
}
const NAF_LABELS: Record<string, string> = {
  '56.10A': 'Restauration traditionnelle', '56.10C': 'Restauration rapide', '10.71C': 'Boulangerie-pâtisserie', '56.21Z': 'Traiteur', '47.25Z': 'Caviste', '47.22Z': 'Boucherie',
  '96.02A': 'Coiffure', '96.02B': 'Soins de beauté', '86.90E': 'Ostéopathie', '86.90D': 'Kinésithérapie', '86.23Z': 'Dentiste',
  '43.22A': 'Plomberie / chauffage', '43.21A': 'Électricité', '43.32A': 'Menuiserie', '25.12Z': 'Menuiserie métal', '47.52A': 'Bricolage', '47.52B': 'Bricolage', '43.34Z': 'Peinture', '43.33Z': 'Carrelage', '81.30Z': 'Paysagiste',
  '47.76Z': 'Fleuriste', '47.78A': 'Opticien', '45.20A': 'Entretien auto', '45.11Z': 'Vente auto', '68.31Z': 'Agence immobilière', '74.20Z': 'Photographe', '93.13Z': 'Salle de sport', '85.53Z': 'Auto-école', '71.11Z': 'Architecte',
}
// Catégorie métier → analyse + services recommandés + angle de vente
const CAT: Record<string, string> = {
  restaurant: 'chr', pizzeria: 'chr', boulangerie: 'chr', traiteur: 'chr', caviste: 'chr', boucherie: 'chr',
  coiffure: 'beaute', 'institut de beaute': 'beaute',
  osteopathe: 'sante', kinesitherapeute: 'sante', dentiste: 'sante',
  plombier: 'btp', electricien: 'btp', menuiserie: 'btp', macon: 'btp', peintre: 'btp', carreleur: 'btp', paysagiste: 'btp',
  'garage automobile': 'auto', 'auto ecole': 'auto',
  'agence immobiliere': 'immo', fleuriste: 'commerce', opticien: 'commerce', 'salle de sport': 'commerce',
  architecte: 'prolib', photographe: 'prolib',
}
const RECO: Record<string, { services: string[]; angle: string }> = {
  chr: { services: ['Site vitrine + menu en ligne', 'Réservation / commande en ligne', 'SEO local', 'Google Business + avis', 'Photos & vidéo'], angle: 'Être trouvé sur Google et permettre de réserver/commander en ligne 24/7.' },
  beaute: { services: ['Site vitrine', 'Prise de RDV en ligne', 'SEO local', 'Google Business + avis', 'Contenu Instagram'], angle: 'Remplir l\'agenda automatiquement via la prise de RDV en ligne.' },
  sante: { services: ['Site professionnel sobre', 'Prise de RDV en ligne', 'SEO local', 'Avis patients'], angle: 'Crédibilité + nouveaux patients qui cherchent un praticien à proximité.' },
  btp: { services: ['Site vitrine + portfolio chantiers', 'Formulaire de devis', 'SEO local (« métier + ville »)', 'Google Business + avis'], angle: 'Capter les demandes de devis locales (ex. « plombier ' + '{ville}' + ' »).' },
  auto: { services: ['Site vitrine', 'Prise de RDV en ligne', 'SEO local', 'Avis Google'], angle: 'RDV en ligne + visibilité sur « garage / auto-école + ville ».' },
  immo: { services: ['Site + portail d\'annonces', 'Capture de leads', 'SEO', 'CRM & automatisation'], angle: 'Générer des leads vendeurs et acheteurs en continu.' },
  commerce: { services: ['Site + e-commerce / clic & collect', 'SEO local', 'Google Business + avis'], angle: 'Vendre en ligne et proposer le clic & collect.' },
  prolib: { services: ['Portfolio premium', 'SEO', 'Page contact optimisée'], angle: 'Un portfolio qui inspire confiance et convertit les visiteurs.' },
  autre: { services: ['Site vitrine', 'SEO local', 'Google Business + avis'], angle: 'Une présence en ligne professionnelle qui ramène des clients.' },
}
const Field = ({ label, value }: { label: string; value: string }) => (
  <div><p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{label}</p><p className="text-sm font-medium" style={{ color: '#111827' }}>{value || '—'}</p></div>
)

/** Dossier client 360° + poste de prospection (actions depuis la fiche). */
export default function ClientDossier({ client, onBack }: { client: Client; onBack: () => void }) {
  const [d, setD] = useState<Dossier | null>(null)
  const [statut, setStatut] = useState<Client['statut']>(client.statut)
  const [savingStatut, setSavingStatut] = useState(false)
  const { commune, site } = useMemo(() => parseNotes(client.notes), [client.notes])
  const tpl = useMemo(() => templates(client, commune), [client, commune])

  const [active, setActive] = useState<keyof ReturnType<typeof templates>>('contact')
  const [to, setTo] = useState(client.email || '')
  const [subject, setSubject] = useState(tpl.contact.subject)
  const [body, setBody] = useState(tpl.contact.body)
  const [copied, setCopied] = useState(false)
  const [sendingMail, setSendingMail] = useState(false)
  const [mailSent, setMailSent] = useState(false)
  const [schedAt, setSchedAt] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const validTo = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to.trim())

  // Suivi (timeline) du prospect : emails envoyés/ouverts/cliqués, appels, SMS
  type Act = { id: string; type: string; payload: { to?: string; subject?: string; kind?: string; link?: string; note?: string; at?: string }; created_at: string }
  const [acts, setActs] = useState<Act[]>([])
  const refreshActs = useCallback(() => {
    const qs = new URLSearchParams({ pid: client.id })
    if (client.email) qs.set('email', client.email)
    fetch(`/api/cms/prospect-activity?${qs}`).then(r => r.json()).then(d => setActs(d.events || [])).catch(() => {})
  }, [client.email, client.id])

  // Analyse du site du prospect (pour personnaliser les emails)
  type Audit = { ok?: boolean; site?: string; unreachable?: boolean; error?: string; audit?: { score: number; responseMs: number; builder?: string; viewport?: boolean; isHttps?: boolean; metaDesc?: boolean }; findings?: { level: 'ok' | 'warn' | 'bad'; label: string }[]; emailLines?: string[] }
  const [audit, setAudit] = useState<Audit | null>(null)
  const [auditing, setAuditing] = useState(false)
  const [loggedAct, setLoggedAct] = useState('')
  // Composeur SMS (envoi pro via Brevo)
  const [smsText, setSmsText] = useState(`Bonjour, Béranger de vivesmedia.com — je crée des sites web pour les ${client.secteur || 'pros'}${commune ? ` de ${commune}` : ''}. Ouvert à un échange rapide ?`)
  const [smsSending, setSmsSending] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  useEffect(() => { crmService.getDossier(client.email).then(setD).catch(() => setD({ devis: [], factures: [], commandes: [] })) }, [client.email])
  useEffect(() => { refreshActs() }, [refreshActs])

  // Envoi direct de l'email depuis la fiche (via vivesmedia.com / Resend) + trace
  const sendViaApp = async () => {
    if (!validTo) { alert('Renseigne une adresse email destinataire valide.'); return }
    const dest = to.trim()
    if (!confirm(`Envoyer cet email à ${dest} depuis contact@vivesmedia.com ?`)) return
    setSendingMail(true)
    try {
      const r = await fetch('/api/cms/prospect-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: dest, subject, body, kind: active, clientId: client.id }) })
      const dd = await r.json()
      if (!r.ok) throw new Error(dd.error || 'Erreur envoi')
      setMailSent(true)
      // Trace + on mémorise l'email trouvé s'il manquait sur la fiche
      const patch: Partial<Client> = { notes: `${client.notes || ''} · EMAIL ENVOYÉ le ${new Date().toLocaleDateString('fr-FR')} (${active})` }
      if (!client.email && dest) patch.email = dest
      clientsService.update(client.id, patch).catch(() => {})
      setTimeout(refreshActs, 900)
    } catch (e) { alert(e instanceof Error ? e.message : 'Erreur') }
    finally { setSendingMail(false) }
  }

  // Programmation de l'envoi (date/heure locale → ISO Paris). Apparaît dans « Envois programmés » + « Suivi prospection ».
  const scheduleViaApp = async () => {
    if (!validTo) { alert('Renseigne une adresse email destinataire valide.'); return }
    if (!schedAt) { alert('Choisis une date et une heure d\'envoi.'); return }
    const iso = `${schedAt}:00+02:00`
    if (new Date(iso).getTime() < Date.now() + 60000) { alert('Choisis un horaire dans le futur.'); return }
    const dest = to.trim()
    if (!confirm(`Programmer l'envoi à ${dest} le ${new Date(iso).toLocaleString('fr-FR')} ?`)) return
    setScheduling(true)
    try {
      const r = await fetch('/api/cms/prospect-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: dest, subject, body, kind: active, clientId: client.id, scheduledAt: iso }) })
      const dd = await r.json()
      if (!r.ok) throw new Error(dd.error || 'Erreur programmation')
      setScheduled(true)
      const patch: Partial<Client> = {}
      if (!client.email && dest) patch.email = dest
      if (Object.keys(patch).length) clientsService.update(client.id, patch).catch(() => {})
      setTimeout(refreshActs, 900)
    } catch (e) { alert(e instanceof Error ? e.message : 'Erreur') }
    finally { setScheduling(false) }
  }

  const pickTpl = (k: keyof ReturnType<typeof templates>) => { setActive(k); setSubject(tpl[k].subject); setBody(tpl[k].body) }
  const mailto = `mailto:${to.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const copy = () => { navigator.clipboard?.writeText(`${subject}\n\n${body}`); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  const markStatut = async (s: Client['statut']) => { setSavingStatut(true); try { await clientsService.update(client.id, { statut: s }); setStatut(s) } catch { /* */ } finally { setSavingStatut(false) } }

  // Téléphones classés + cible SMS (mobiles uniquement)
  const ph = useMemo(() => parsePhones(client.notes), [client.notes])
  const mobileNum = isMobile(client.telephone) ? (client.telephone || '') : ph.mobile
  const fixeNum = (client.telephone && !isMobile(client.telephone)) ? client.telephone : ph.fixe
  const smsBody = `Bonjour, Béranger de vivesmedia.com — je crée des sites web pour les ${client.secteur || 'pros'}${commune ? ` de ${commune}` : ''} et j'améliore leur visibilité Google. Ouvert à un échange ? vivesmedia.com`
  const smsHref = mobileNum ? `sms:${normPhone(mobileNum)}?body=${encodeURIComponent(smsBody)}` : ''
  // WhatsApp click-to-chat (gratuit) : numéro FR 0X… → format international 33X…
  const waRaw = normPhone(mobileNum || fixeNum)
  const waHref = waRaw ? `https://wa.me/33${waRaw.replace(/^0/, '')}?text=${encodeURIComponent(smsBody)}` : ''
  const emTag = emailType(client.email)
  const info = useMemo(() => parseInfo(client.notes), [client.notes])
  const cat = CAT[client.secteur || ''] || 'autre'
  const reco = RECO[cat]
  const sirenUrl = info.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${info.siren}` : ''
  const nafLabel = NAF_LABELS[info.naf] || info.naf || ''
  const anciennete = info.an ? new Date().getFullYear() - parseInt(info.an) : null
  const recoAngle = reco.angle.replace('{ville}', info.commune || 'votre ville')

  // Lance l'analyse du site du prospect et mémorise un résumé dans la fiche
  const runAudit = async () => {
    if (!site) return
    setAuditing(true); setAudit(null)
    try {
      const r = await fetch('/api/cms/site-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: site }) })
      const dd = (await r.json()) as Audit
      setAudit(dd)
      if (dd.ok && dd.audit) {
        const a = dd.audit
        const note = `${client.notes || ''} · AUDIT ${new Date().toLocaleDateString('fr-FR')}: ${a.score}/100 (${a.builder || 'site'}, ${(a.responseMs / 1000).toFixed(1)}s${a.viewport ? '' : ', non responsive'}${a.isHttps ? '' : ', sans HTTPS'})`
        clientsService.update(client.id, { notes: note }).catch(() => {})
      }
    } catch { setAudit({ error: 'Analyse impossible' }) }
    finally { setAuditing(false) }
  }
  // Génère un email 100% personnalisé à partir des observations de l'audit
  const useAuditInEmail = () => {
    const lines = audit?.emailLines || []
    if (!lines.length) return
    const ent = cleanCompany(client.entreprise || client.nom) || 'votre entreprise'
    const lieu = commune ? ` à ${commune}` : ''
    const prenom = firstNameOf(parseInfo(client.notes).dirigeant)
    const hello = prenom ? `Bonjour ${prenom},` : 'Bonjour,'
    const sign = '\n\nBonne journée,\nBéranger Vives\nvivesmedia.com'
    const numbered = lines.map((l, i) => `${i + 1}) ${l}`).join('\n')
    const plural = lines.length > 1 ? 's' : ''
    setActive('audit')
    setSubject(`${lines.length} point${plural} à améliorer pour ${ent}`)
    setBody(`${hello}\n\nJe suis tombé sur le site de ${ent}${lieu} et je l'ai regardé en détail. ${lines.length} point${plural} vous font aujourd'hui perdre des clients :\n\n${numbered}\n\nTout cela se corrige rapidement. Si vous le souhaitez, je vous montre comment en 10 minutes — sans engagement.${sign}`)
  }
  // Journalise un appel / SMS dans le suivi
  const logAction = async (kind: 'call' | 'sms' | 'whatsapp') => {
    try {
      await fetch('/api/cms/prospect-activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: client.id, email: client.email || null, phone: mobileNum || fixeNum || null, kind }) })
      setLoggedAct(kind); setTimeout(() => setLoggedAct(''), 2500); setTimeout(refreshActs, 500)
    } catch { /* best-effort */ }
  }
  // Envoi du SMS via Brevo (backend), expéditeur « vivesmedia »
  const sendSmsBrevo = async () => {
    const num = mobileNum || fixeNum
    if (!num || !smsText.trim()) return
    if (!confirm(`Envoyer ce SMS à ${num} via vivesmedia (Brevo, ~0,05 €) ?`)) return
    setSmsSending(true)
    try {
      const r = await fetch('/api/cms/prospect-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: num, text: smsText, clientId: client.id }) })
      const dd = await r.json()
      if (!r.ok) throw new Error(dd.error || 'Erreur SMS')
      setSmsSent(true)
      clientsService.update(client.id, { notes: `${client.notes || ''} · SMS ENVOYÉ le ${new Date().toLocaleDateString('fr-FR')}` }).catch(() => {})
      setTimeout(refreshActs, 800)
    } catch (e) { alert(e instanceof Error ? e.message : 'Erreur') }
    finally { setSmsSending(false) }
  }
  const sentN = acts.filter(a => a.type === 'prospect_email').length
  const openN = acts.filter(a => a.type === 'email_open').length
  const clickN = acts.filter(a => a.type === 'email_click').length

  const caFactures = (d?.factures ?? []).filter(f => f.statut === 'payee').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
  const caCommandes = (d?.commandes ?? []).filter(c => c.statut === 'paye').reduce((s, c) => s + Number(c.montant || 0), 0)
  const caTotal = caFactures + caCommandes
  const enAttente = (d?.factures ?? []).filter(f => f.statut === 'envoyee' || f.statut === 'en_retard').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
  const card = { background: '#fff', border: '1px solid #E9ECEF' }
  const isProspect = statut === 'prospect' || statut === 'pause'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-xs flex items-center gap-1" style={{ color: '#9CA3AF' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux clients
        </button>
        <button onClick={async () => { if (!confirm(`Supprimer définitivement la fiche « ${client.nom} » ? Action irréversible.`)) return; try { await clientsService.delete(client.id); onBack() } catch (e) { alert(e instanceof Error ? e.message : 'Erreur') } }}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ border: '1px solid #FECACA', color: '#DC2626' }}>
          <Trash2 className="w-3.5 h-3.5" /> Supprimer la fiche
        </button>
      </div>

      {/* Entête client */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: ORANGE }}>
              {client.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{client.nom}</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>{client.entreprise || '—'}</p>
            </div>
            <span className="ml-2"><Badge value={statut} map={STATUT_COLORS} /></span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm" style={{ color: '#6B7280' }}>
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:underline">
                <Mail className="w-3.5 h-3.5" /> {client.email}
                <span className="text-[10px] px-1.5 rounded-full font-medium" style={emTag === 'pro' ? { background: '#DCFCE7', color: '#16A34A' } : { background: '#FEF3C7', color: '#D97706' }}>{emTag}</span>
              </a>
            )}
            {mobileNum && (
              <a href={`tel:${normPhone(mobileNum)}`} className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" /> {mobileNum}
                <span className="text-[10px] px-1.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>mobile</span>
              </a>
            )}
            {fixeNum && (
              <a href={`tel:${normPhone(fixeNum)}`} className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" /> {fixeNum}
                <span className="text-[10px] px-1.5 rounded-full font-medium" style={{ background: '#F1F5F9', color: '#64748B' }}>fixe</span>
              </a>
            )}
            {commune && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {commune}</span>}
            {client.secteur && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {client.secteur}</span>}
            {site && <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: ORANGE }}><Globe className="w-3.5 h-3.5" /> site</a>}
          </div>
        </div>
        {/* Changement de statut rapide */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Statut :</span>
          {STATUTS.map(s => (
            <button key={s} onClick={() => markStatut(s)} disabled={savingStatut}
              className="text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ background: statut === s ? '#0F172A' : '#fff', color: statut === s ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── INFORMATIONS ENTREPRISE (open data) ── */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Informations entreprise</h2></div>
          {sirenUrl && <a href={sirenUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: ORANGE }}>Fiche officielle INSEE →</a>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Field label="Secteur" value={client.secteur || ''} />
          <Field label="Activité (NAF)" value={nafLabel} />
          <Field label="Commune" value={info.commune ? `${info.commune} (${info.cp})` : ''} />
          <Field label="Dirigeant" value={info.dirigeant} />
          <Field label="Créée en" value={info.an ? `${info.an}${anciennete ? ` · ${anciennete} ans` : ''}` : ''} />
          <Field label="Effectif" value={info.eff && info.eff !== 'NN' && info.eff !== '?' ? info.eff : 'micro / NC'} />
          <Field label="SIREN" value={info.siren} />
          <Field label="Score ICP" value={info.score ? `${info.score}/10` : ''} />
        </div>
      </div>

      {/* ── ANALYSE & RECOMMANDATIONS ── */}
      <div className="rounded-xl p-6 mb-4" style={{ ...card, borderColor: 'rgba(244,82,30,.25)' }}>
        <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Analyse & recommandations</h2></div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
          <strong>{client.entreprise || client.nom}</strong> — {client.secteur || 'professionnel'}{info.commune ? ` à ${info.commune}` : ''}
          {anciennete !== null && (anciennete <= 2 ? ', structure récente (souvent sans site → besoin d\'une première vitrine).' : `, établie depuis ${anciennete} ans (site potentiellement à moderniser).`)}
          {!site && ' Aucun site web détecté pour l\'instant — angle de vente direct.'}
          {site && ' Un site existe : cibler la refonte / le SEO / la conversion.'}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>Services à proposer</p>
            <div className="flex flex-wrap gap-1.5">
              {reco.services.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(244,82,30,.08)', color: '#F4521E' }}>{s}</span>)}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>Angle de vente</p>
            <p className="text-sm" style={{ color: '#374151' }}>{recoAngle}</p>
          </div>
        </div>
      </div>

      {/* ── POSTE DE PROSPECTION (actions depuis la fiche) ── */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Contacter ce prospect</h2>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(mobileNum || fixeNum) && (
            <a href={`tel:${normPhone(mobileNum || fixeNum)}`} onClick={() => logAction('call')} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
              <Phone className="w-4 h-4" /> Appeler{loggedAct === 'call' ? ' ✓' : ''}
            </a>
          )}
          {smsHref && (
            <a href={smsHref} onClick={() => logAction('sms')} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              <MessageSquare className="w-4 h-4" /> SMS{loggedAct === 'sms' ? ' ✓' : ''}
            </a>
          )}
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => logAction('whatsapp')} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ background: '#25D366' }}>
              <MessageCircle className="w-4 h-4" /> WhatsApp{loggedAct === 'whatsapp' ? ' ✓' : ''}
            </a>
          )}
          {site && (
            <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              <Globe className="w-4 h-4" /> Voir leur site
            </a>
          )}
          {site && (
            <button onClick={runAudit} disabled={auditing} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50" style={{ border: '1px solid rgba(244,82,30,.4)', color: ORANGE }}>
              <Gauge className="w-4 h-4" /> {auditing ? 'Analyse…' : 'Analyser le site'}
            </button>
          )}
          {isProspect && (
            <button onClick={() => markStatut('actif')} disabled={savingStatut} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50" style={{ border: '1px solid #E5E7EB', color: '#16A34A' }}>
              <UserCheck className="w-4 h-4" /> Convertir en client
            </button>
          )}
        </div>

        {/* Résultat de l'analyse du site → personnalisation de l'email */}
        {audit && (
          <div className="rounded-lg p-4 mb-4" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            {audit.error || audit.unreachable ? (
              <p className="text-sm" style={{ color: '#B91C1C' }}>{audit.error || 'Site injoignable (ne répond pas ou trop lent).'}</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Gauge className="w-4 h-4" style={{ color: ORANGE }} /><h3 className="text-sm font-bold" style={{ color: '#111827' }}>Analyse du site</h3></div>
                  <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: (audit.audit?.score ?? 0) >= 70 ? '#DCFCE7' : (audit.audit?.score ?? 0) >= 45 ? '#FEF3C7' : '#FEE2E2', color: (audit.audit?.score ?? 0) >= 70 ? '#16A34A' : (audit.audit?.score ?? 0) >= 45 ? '#D97706' : '#DC2626' }}>{audit.audit?.score}/100</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(audit.findings || []).map((fd, i) => (
                    <span key={i} className="text-[11px] px-2 py-1 rounded-md" style={fd.level === 'bad' ? { background: '#FEE2E2', color: '#B91C1C' } : fd.level === 'warn' ? { background: '#FEF3C7', color: '#92400E' } : { background: '#ECFDF5', color: '#047857' }}>{fd.label}</span>
                  ))}
                </div>
                {(audit.emailLines?.length ?? 0) > 0 && (
                  <button onClick={useAuditInEmail} className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
                    <Send className="w-3.5 h-3.5" /> Générer l'email personnalisé à partir de cette analyse
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Composeur SMS — envoi pro via Brevo + option gratuite via le tél */}
        {(mobileNum || fixeNum) && (
          <div className="rounded-lg p-4 mb-4" style={{ background: '#F8F9FA', border: '1px solid #F1F3F5' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#111827' }}><MessageSquare className="w-4 h-4" style={{ color: ORANGE }} /> SMS</h3>
              <span className="text-[11px]" style={{ color: smsText.length > 160 ? '#DC2626' : '#9CA3AF' }}>{smsText.length}/160</span>
            </div>
            <textarea value={smsText} onChange={e => { setSmsText(e.target.value); setSmsSent(false) }} rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#374151' }} />
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button onClick={sendSmsBrevo} disabled={smsSending || smsSent || !smsText.trim()}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50" style={{ background: smsSent ? '#16A34A' : ORANGE }}>
                {smsSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />} {smsSent ? 'Envoyé ✓' : smsSending ? 'Envoi…' : 'Envoyer (vivesmedia)'}
              </button>
              {smsHref && (
                <a href={smsHref} onClick={() => logAction('sms')} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
                  <Phone className="w-4 h-4" /> Depuis mon tél (gratuit)
                </a>
              )}
            </div>
            <p className="text-[11px] mt-2" style={{ color: '#9CA3AF' }}>« Envoyer (vivesmedia) » = SMS pro via Brevo (~0,05 €, expéditeur « vivesmedia », créneau légal 8h-20h hors dimanche). « Depuis mon tél » = gratuit via ton forfait (ton numéro visible).</p>
          </div>
        )}

        {/* Trouver les coordonnées manquantes (1 clic) */}
        {(!client.email || (!mobileNum && !fixeNum)) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs p-3 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <span style={{ color: '#92400E' }}>Coordonnées manquantes — trouve-les :</span>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(client.nom + ' ' + commune)}`} target="_blank" rel="noopener noreferrer" className="font-semibold px-2 py-1 rounded-md" style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}>Google</a>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(client.nom + ' ' + commune)}`} target="_blank" rel="noopener noreferrer" className="font-semibold px-2 py-1 rounded-md" style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}>Maps</a>
            <a href={`https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${encodeURIComponent(client.nom)}&ou=${encodeURIComponent(commune || 'Vaucluse')}`} target="_blank" rel="noopener noreferrer" className="font-semibold px-2 py-1 rounded-md" style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}>PagesJaunes</a>
            <span style={{ color: '#92400E' }}>→ puis « Modifier » la fiche pour les enregistrer.</span>
          </div>
        )}

        {/* Composeur d'email personnalisé */}
        <div className="rounded-lg p-4" style={{ background: '#F8F9FA', border: '1px solid #F1F3F5' }}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(Object.keys(tpl) as (keyof typeof tpl)[]).map(k => (
              <button key={k} onClick={() => pickTpl(k)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: active === k ? ORANGE : '#fff', color: active === k ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>
                {tpl[k].label}
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed mb-2" style={{ color: '#9CA3AF' }}>💡 {COLD_TIPS}</p>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium mb-2 outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={9}
            className="w-full px-3 py-2 rounded-lg text-sm leading-relaxed outline-none resize-y" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#374151' }} />
          {/* Destinataire modifiable : si la fiche n'a pas d'email, colle celui que tu trouves */}
          <div className="mt-3">
            <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: '#9CA3AF' }}>Destinataire</label>
            <div className="flex items-center gap-2">
              <input type="email" value={to} onChange={e => { setTo(e.target.value); setMailSent(false) }} placeholder="email@duprospect.fr"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${to && !validTo ? '#FCA5A5' : '#E5E7EB'}`, background: '#fff', color: '#111827' }} />
              {client.email && to.trim() === client.email && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={emTag === 'pro' ? { background: '#DCFCE7', color: '#16A34A' } : { background: '#FEF3C7', color: '#D97706' }}>{emTag}</span>
              )}
            </div>
            {!client.email && <p className="text-[11px] mt-1" style={{ color: '#92400E' }}>Pas d'email sur la fiche — colle celui que tu trouves (boutons « Trouver les coordonnées » ci-dessus). Il sera enregistré à l'envoi.</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button onClick={sendViaApp} disabled={sendingMail || mailSent || !validTo} title={!validTo ? 'Renseigne un email destinataire' : ''}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50" style={{ background: mailSent ? '#16A34A' : ORANGE }}>
              {mailSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />} {mailSent ? 'Envoyé ✓' : sendingMail ? 'Envoi…' : 'Envoyer (vivesmedia.com)'}
            </button>
            <a href={validTo ? mailto : undefined} onClick={e => { if (!validTo) e.preventDefault() }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: validTo ? '#374151' : '#C4C4C4' }}>
              <Mail className="w-4 h-4" /> Ouvrir dans ma messagerie
            </a>
            <button onClick={copy} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: copied ? '#16A34A' : '#374151' }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copié' : 'Copier'}
            </button>
            {isProspect && (
              <button onClick={() => markStatut('actif')} disabled={savingStatut} className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                marquer comme client →
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>⏰ Ou programmer&nbsp;:</span>
            <input type="datetime-local" value={schedAt} onChange={e => setSchedAt(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg outline-none" style={{ border: '1px solid #E5E7EB', color: '#111827' }} />
            <button onClick={scheduleViaApp} disabled={scheduling || scheduled || !validTo || !schedAt}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-50" style={{ background: scheduled ? '#16A34A' : '#0F172A' }}>
              {scheduled ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />} {scheduled ? 'Programmé ✓' : scheduling ? 'Programmation…' : 'Programmer l\'envoi'}
            </button>
            <a href="/cms/programmes" className="text-[11px]" style={{ color: '#9CA3AF' }}>voir les envois programmés →</a>
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#9CA3AF' }}>« Envoyer » part de contact@vivesmedia.com (trace conservée). « Programmer » planifie l'envoi (visible dans Envois programmés + Suivi prospection). « Ouvrir dans ma messagerie » part de ta boîte perso. Sans email, utilise l'appel / le SMS.</p>
        </div>
      </div>

      {/* ── SUIVI & HISTORIQUE (tracking live) ── */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Suivi & historique</h2></div>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#6B7280' }}>
            <span className="flex items-center gap-1"><Send className="w-3.5 h-3.5" style={{ color: ORANGE }} /> {sentN} envoyé{sentN > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" style={{ color: '#16A34A' }} /> {openN} ouvert{openN > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" style={{ color: '#2563EB' }} /> {clickN} clic{clickN > 1 ? 's' : ''}</span>
          </div>
        </div>
        {acts.length === 0 ? (
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune action pour l'instant. Les emails envoyés, leurs <strong>ouvertures</strong> et <strong>clics</strong> (suivis en direct), ainsi que les appels et SMS, apparaîtront ici.</p>
        ) : (
          <div className="space-y-2">
            {acts.map(a => { const m = ACT_META[a.type] || ACT_META.default; return (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: m.bg }}><m.icon className="w-3.5 h-3.5" style={{ color: m.fg }} /></span>
                <span className="min-w-0 truncate" style={{ color: '#374151' }}>
                  <strong style={{ color: '#111827' }}>{m.label}</strong>
                  {a.payload?.kind && a.type === 'prospect_email' ? ` · ${a.payload.kind}` : ''}
                  {a.payload?.subject ? ` — « ${a.payload.subject} »` : ''}
                  {a.payload?.link ? ` → ${a.payload.link}` : ''}
                </span>
                <span className="ml-auto text-xs shrink-0" style={{ color: '#9CA3AF' }}>{new Date(a.payload?.at || a.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) })}
          </div>
        )}
      </div>

      {/* KPIs dossier */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'CA encaissé', value: euro(caTotal), icon: Euro, accent: true },
          { label: 'En attente', value: euro(enAttente), icon: Receipt, accent: false },
          { label: 'Devis', value: String(d?.devis.length ?? '…'), icon: FileText, accent: false },
          { label: 'Commandes', value: String(d?.commandes.length ?? '…'), icon: ShoppingBag, accent: false },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ ...card, borderColor: k.accent ? 'rgba(244,82,30,.25)' : '#E9ECEF' }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</p>
              <k.icon className="w-4 h-4" style={{ color: k.accent ? ORANGE : '#94A3B8' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: k.accent ? ORANGE : '#111827' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Listes liées */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Devis</h2></div>
          {d && d.devis.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucun devis</p>}
          <div className="space-y-2">
            {(d?.devis ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate" style={{ color: '#374151' }}>{x.service || 'Demande'}<span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>{new Date(x.created_at).toLocaleDateString('fr-FR')}</span></span>
                <Badge value={x.statut} map={DEVIS_COLORS} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><Receipt className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Factures</h2></div>
          {d && d.factures.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune facture</p>}
          <div className="space-y-2">
            {(d?.factures ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate font-mono text-xs" style={{ color: '#374151' }}>{x.numero}</span>
                <span className="flex items-center gap-2 shrink-0"><strong style={{ color: '#111827' }}>{euro(x.montant_ttc)}</strong><Badge value={x.statut} map={FACT_COLORS} /></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><ShoppingBag className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Commandes Stripe</h2></div>
          {d && d.commandes.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune commande</p>}
          <div className="space-y-2">
            {(d?.commandes ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate" style={{ color: '#374151' }}>{x.service || 'Commande'}</span>
                <span className="flex items-center gap-2 shrink-0"><strong style={{ color: '#111827' }}>{euro(x.montant)}</strong><Badge value={x.statut} map={CMD_COLORS} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
