'use client'
import { useEffect, useMemo, useState } from 'react'
import { crmService, clientsService, type ClientDossier as Dossier } from '@/services/supabase.service'
import type { Client } from '@/types'
import { FileText, Receipt, ShoppingBag, Euro, Mail, Phone, Building2, ArrowLeft, Globe, Send, Copy, Check, UserCheck, MapPin, MessageSquare } from 'lucide-react'

const ORANGE = '#F4521E'
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
function templates(c: Client, commune: string) {
  const ent = c.entreprise || c.nom
  const sect = c.secteur || 'professionnel'
  const lieu = commune ? ` à ${commune}` : ''
  const sign = '\n\nBonne journée,\nBéranger Vives\nvivesmedia.com'
  return {
    contact: {
      label: '1er contact',
      subject: `${ent} sur Google`,
      body: `Bonjour,\n\nJe cherchais des ${sect}s${lieu} et je suis tombé sur ${ent}.\n\nJe suis développeur web indépendant (vivesmedia.com) : j'aide des pros${lieu} à mieux ressortir sur Google et à transformer plus de visiteurs en clients, avec un site clair et rapide.\n\nSeriez-vous ouvert(e) à ce que je vous envoie 2-3 pistes concrètes pour ${ent} ? Ça ne vous engage à rien.${sign}`,
    },
    relance: {
      label: 'Relance',
      subject: `Re : ${ent} sur Google`,
      body: `Bonjour,\n\nJe me permets un petit rappel — aucun souci si ce n'est pas le moment.\n\nSi gagner en visibilité pour ${ent} vous intéresse, répondez-moi simplement « oui » et je vous envoie mes idées.${sign}`,
    },
    rdv: {
      label: 'Proposer un RDV',
      subject: `15 min pour ${ent} ?`,
      body: `Bonjour,\n\nPlutôt que de longs emails : on échange 15 minutes ? Je vous montre 2-3 choses simples pour que ${ent} attire plus de clients via son site et Google.\n\nDites-moi un créneau qui vous arrange, je m'adapte.${sign}`,
    },
  }
}

// Conseils cold email (affichés dans la fiche)
const COLD_TIPS = 'Court (50-90 mots) · parle d\'EUX d\'abord · 1 seule question · pas de « gratuit/promo » dans l\'objet · relance après 3-4 jours (le mardi/mercredi 10h-11h convertit le mieux).'

/** Dossier client 360° + poste de prospection (actions depuis la fiche). */
export default function ClientDossier({ client, onBack }: { client: Client; onBack: () => void }) {
  const [d, setD] = useState<Dossier | null>(null)
  const [statut, setStatut] = useState<Client['statut']>(client.statut)
  const [savingStatut, setSavingStatut] = useState(false)
  const { commune, site } = useMemo(() => parseNotes(client.notes), [client.notes])
  const tpl = useMemo(() => templates(client, commune), [client, commune])

  const [active, setActive] = useState<keyof ReturnType<typeof templates>>('contact')
  const [subject, setSubject] = useState(tpl.contact.subject)
  const [body, setBody] = useState(tpl.contact.body)
  const [copied, setCopied] = useState(false)

  useEffect(() => { crmService.getDossier(client.email).then(setD).catch(() => setD({ devis: [], factures: [], commandes: [] })) }, [client.email])

  const pickTpl = (k: keyof ReturnType<typeof templates>) => { setActive(k); setSubject(tpl[k].subject); setBody(tpl[k].body) }
  const mailto = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const copy = () => { navigator.clipboard?.writeText(`${subject}\n\n${body}`); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  const markStatut = async (s: Client['statut']) => { setSavingStatut(true); try { await clientsService.update(client.id, { statut: s }); setStatut(s) } catch { /* */ } finally { setSavingStatut(false) } }

  // Téléphones classés + cible SMS (mobiles uniquement)
  const ph = useMemo(() => parsePhones(client.notes), [client.notes])
  const mobileNum = isMobile(client.telephone) ? (client.telephone || '') : ph.mobile
  const fixeNum = (client.telephone && !isMobile(client.telephone)) ? client.telephone : ph.fixe
  const smsBody = `Bonjour, Béranger de vivesmedia.com — j'aide les ${client.secteur || 'pros'}${commune ? ` de ${commune}` : ''} à être plus visibles sur Google. Ouvert à un échange ? vivesmedia.com`
  const smsHref = mobileNum ? `sms:${normPhone(mobileNum)}?body=${encodeURIComponent(smsBody)}` : ''
  const emTag = emailType(client.email)

  const caFactures = (d?.factures ?? []).filter(f => f.statut === 'payee').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
  const caCommandes = (d?.commandes ?? []).filter(c => c.statut === 'paye').reduce((s, c) => s + Number(c.montant || 0), 0)
  const caTotal = caFactures + caCommandes
  const enAttente = (d?.factures ?? []).filter(f => f.statut === 'envoyee' || f.statut === 'en_retard').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
  const card = { background: '#fff', border: '1px solid #E9ECEF' }
  const isProspect = statut === 'prospect' || statut === 'pause'

  return (
    <div>
      <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux clients
      </button>

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
        {client.notes && <p className="text-sm mt-4 pt-4 leading-relaxed" style={{ color: '#6B7280', borderTop: '1px solid #F3F4F6' }}>{client.notes}</p>}

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

      {/* ── POSTE DE PROSPECTION (actions depuis la fiche) ── */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Contacter ce prospect</h2>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(mobileNum || fixeNum) && (
            <a href={`tel:${normPhone(mobileNum || fixeNum)}`} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
              <Phone className="w-4 h-4" /> Appeler
            </a>
          )}
          {smsHref && (
            <a href={smsHref} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              <MessageSquare className="w-4 h-4" /> SMS
            </a>
          )}
          {site && (
            <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              <Globe className="w-4 h-4" /> Voir leur site
            </a>
          )}
          {isProspect && (
            <button onClick={() => markStatut('actif')} disabled={savingStatut} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50" style={{ border: '1px solid #E5E7EB', color: '#16A34A' }}>
              <UserCheck className="w-4 h-4" /> Convertir en client
            </button>
          )}
        </div>

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
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {client.email ? (
              <a href={mailto} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: ORANGE }}>
                <Mail className="w-4 h-4" /> Ouvrir dans ma messagerie
              </a>
            ) : (
              <span className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>Pas d'email — appelle ou copie le message</span>
            )}
            <button onClick={copy} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: copied ? '#16A34A' : '#374151' }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copié' : 'Copier'}
            </button>
            {isProspect && (
              <button onClick={() => markStatut('actif')} disabled={savingStatut} className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                marquer comme contacté →
              </button>
            )}
          </div>
        </div>
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
