'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientsService, devisService, facturesService, commandesService } from '@/services/supabase.service'
import type { Client, Devis, Facture, Commande } from '@/types'
import {
  Plus, FileText, Receipt, ShoppingBag, Clock, TrendingUp, TrendingDown,
  ChevronRight, CalendarDays, CheckCircle2, Bell
} from 'lucide-react'

const OBJECTIF_MENSUEL = 12000 // provisoire ; deviendra éditable via l'onglet Paramètres

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
const monthStartOffset = (o: number) => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - o, 1) }
const inMonth = (iso: string, o: number) => { const d = new Date(iso); const s = monthStartOffset(o); const e = monthStartOffset(o - 1); return d >= s && d < e }

/** Série mensuelle (6 derniers mois, du plus ancien au plus récent). */
function monthly(records: { created_at: string }[], value: (r: never) => number, agg: 'sum' | 'count') {
  const out: number[] = []
  for (let o = 5; o >= 0; o--) {
    const rs = records.filter(r => inMonth(r.created_at, o))
    out.push(agg === 'count' ? rs.length : rs.reduce((s, r) => s + value(r as never), 0))
  }
  return out
}

/** Chemin SVG lissé (Catmull-Rom → Bézier) à partir de valeurs. */
function smoothPath(vals: number[], w: number, h: number, pad = 6) {
  const empty: { line: string; area: string; end: [number, number] | undefined } = { line: '', area: '', end: undefined }
  if (!vals.length) return empty
  const max = Math.max(...vals, 1), min = Math.min(...vals, 0)
  const span = max - min || 1
  const pts = vals.map((v, i) => [
    vals.length === 1 ? w : (i / (vals.length - 1)) * w,
    h - pad - ((v - min) / span) * (h - pad * 2),
  ] as [number, number])
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  const area = `${d}L${pts[pts.length - 1][0]},${h}L${pts[0][0]},${h}Z`
  return { line: d, area, end: pts[pts.length - 1] }
}

function useCountUp(target: number, deps: unknown[]) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(target); return }
    let raf = 0, t0 = 0
    const step = (ts: number) => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / 1000, 1); setVal(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return val
}

function Chip({ tone, children }: { tone: 'up' | 'down' | 'neutral'; children: React.ReactNode }) {
  const map = {
    up: { bg: 'var(--cms-ok-bg)', fg: 'var(--cms-ok-fg)', Ic: TrendingUp },
    down: { bg: 'var(--cms-danger-bg)', fg: 'var(--cms-danger-fg)', Ic: TrendingDown },
    neutral: { bg: 'var(--cms-surface-2)', fg: 'var(--cms-muted)', Ic: null },
  }[tone]
  return (
    <span className="inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap" style={{ background: map.bg, color: map.fg, fontSize: '.7rem', padding: '3px 9px 3px 7px' }}>
      {map.Ic && <map.Ic className="w-3 h-3" strokeWidth={2.6} />}{children}
    </span>
  )
}

function Spark({ vals, color }: { vals: number[]; color: string }) {
  const { line } = smoothPath(vals, 200, 30, 5)
  return (
    <svg width="100%" height="30" viewBox="0 0 200 30" preserveAspectRatio="none" className="mt-2 block">
      <path className="draw" pathLength={1} d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Agenda = { time: string; title: string; sub?: string }

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [devis, setDevis] = useState<Devis[]>([])
  const [factures, setFactures] = useState<Facture[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [suivi, setSuivi] = useState({ sent: 0, open: 0, click: 0, call: 0, sms: 0, whatsapp: 0 })
  const [agenda, setAgenda] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cms/prospect-activity?summary=1').then(r => r.json()).then(d => {
      const c = d.counts || {}
      setSuivi({ sent: c.prospect_email || 0, open: c.email_open || 0, click: c.email_click || 0, call: c.prospect_call || 0, sms: c.prospect_sms || 0, whatsapp: c.prospect_whatsapp || 0 })
    }).catch(() => {})
    fetch('/api/cms/agenda').then(r => r.json()).then(d => {
      const evs = (d?.events || d?.today || d?.items || []) as { start?: string; startTime?: string; summary?: string; title?: string; location?: string }[]
      const today = new Date().toDateString()
      const mapped: Agenda[] = evs.map(e => {
        const raw = e.start || e.startTime || ''
        const dt = raw ? new Date(raw) : null
        return { when: dt, time: dt ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '', title: e.summary || e.title || 'RDV', sub: e.location } as Agenda & { when: Date | null }
      }).filter((e: Agenda & { when: Date | null }) => e.when && e.when.toDateString() === today)
        .sort((a: Agenda & { when: Date | null }, b: Agenda & { when: Date | null }) => (a.when!.getTime() - b.when!.getTime()))
        .slice(0, 3)
      setAgenda(mapped)
    }).catch(() => {})
    Promise.all([clientsService.getAll(), devisService.getAll(), facturesService.getAll(), commandesService.getAll()])
      .then(([c, d, f, o]) => { setClients(c); setDevis(d); setFactures(f); setCommandes(o); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ── Métriques réelles ───────────────────────────────
  const facturesPayees = factures.filter(f => f.statut === 'payee')
  const revMois = facturesPayees.filter(f => inMonth(f.created_at, 0)).reduce((s, f) => s + f.montant_ttc, 0)
  const revPrec = facturesPayees.filter(f => inMonth(f.created_at, 1)).reduce((s, f) => s + f.montant_ttc, 0)
  const revTrend = revPrec > 0 ? Math.round(((revMois - revPrec) / revPrec) * 100) : (revMois > 0 ? 100 : 0)
  const pct = Math.min(100, Math.round((revMois / OBJECTIF_MENSUEL) * 100))
  const reste = Math.max(0, OBJECTIF_MENSUEL - revMois)
  const enAttente = factures.filter(f => f.statut === 'envoyee' || f.statut === 'en_retard')
  const enAttenteMontant = enAttente.reduce((s, f) => s + f.montant_ttc, 0)

  const devisNonLus = devis.filter(d => !d.lu)
  const oldestUnread = devisNonLus.length ? devisNonLus.reduce((a, b) => (a.created_at < b.created_at ? a : b)) : null
  const joursDepuis = (iso?: string) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0

  const devisAcceptes = devis.filter(d => d.statut === 'accepte').length
  const conversion = devis.length ? Math.round((devisAcceptes / devis.length) * 100) : 0
  const panierMoyen = facturesPayees.length ? Math.round(facturesPayees.reduce((s, f) => s + f.montant_ttc, 0) / facturesPayees.length) : 0
  const clientsActifs = clients.filter(c => c.statut === 'actif').length
  const nouveauxMois = clients.filter(c => c.statut === 'actif' && inMonth(c.created_at, 0)).length

  // funnel (compteurs réels)
  const nProspects = clients.filter(c => c.statut === 'prospect').length
  const nDiscussion = devis.filter(d => d.statut === 'contacte' || d.statut === 'en_cours').length
  const facturesRetard = factures.filter(f => f.statut === 'en_retard')
  const contacted = (n?: string) => !!n && (n.includes('EMAIL ENVOYÉ') || n.includes('SMS ENVOYÉ'))
  const aRelancer = clients.filter(c => c.statut === 'prospect' && (c.email || c.telephone) && !contacted(c.notes)).length

  // séries mensuelles réelles
  const serieRev = monthly(facturesPayees, (f: Facture) => f.montant_ttc, 'sum')
  const serieDevis = monthly(devis, () => 1, 'count')
  const serieAccept = monthly(devis.filter(d => d.statut === 'accepte'), () => 1, 'count')
  const serieClients = monthly(clients.filter(c => c.statut === 'actif'), () => 1, 'count')

  // donut CA par service (commandes payées)
  const cmdPayees = commandes.filter(c => c.statut === 'paye')
  const parService = new Map<string, number>()
  cmdPayees.forEach(c => { const k = c.service || 'Autres'; parService.set(k, (parService.get(k) || 0) + c.montant) })
  const donut = [...parService.entries()].sort((a, b) => b[1] - a[1])
  const donutTotal = donut.reduce((s, d) => s + d[1], 0)
  const DONUT_COLORS = ['var(--cms-brand)', '#8FB4E8', 'var(--cms-ok-fg)', 'var(--cms-surface-3)']

  // activité récente
  const recent = [
    ...devis.map(d => ({ id: 'd' + d.id, label: `Devis — ${d.nom}`, sub: d.service || 'Demande de devis', date: d.created_at, href: '/cms/devis', Icon: FileText, bg: 'var(--cms-brand-wash)', fg: 'var(--cms-brand)' })),
    ...factures.filter(f => f.statut === 'payee').map(f => ({ id: 'f' + f.id, label: `Facture ${f.numero} payée`, sub: `${f.client_nom} · ${eur(f.montant_ttc)}`, date: f.created_at, href: '/cms/factures', Icon: Receipt, bg: '#EDE9FE', fg: '#7C56C7' })),
    ...commandes.map(c => ({ id: 'c' + c.id, label: `Commande — ${c.client_nom || c.client_email || '—'}`, sub: `${c.service || ''} · ${eur(c.montant)}`, date: c.created_at, href: '/cms/commandes', Icon: ShoppingBag, bg: 'var(--cms-ok-bg)', fg: 'var(--cms-ok-fg)' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const revAnim = useCountUp(revMois, [revMois])
  const pctAnim = useCountUp(pct, [pct])
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'
  const area = smoothPath(serieRev, 620, 120, 12)

  const KPI = [
    { l: 'Devis non lus', v: devisNonLus.length, sfx: '', chip: devisNonLus.length ? { t: 'down' as const, x: `${devisNonLus.length} en attente` } : { t: 'neutral' as const, x: 'à jour' }, cmp: oldestUnread ? <>le plus vieux <b style={{ color: 'var(--cms-ink-2)' }}>il y a {joursDepuis(oldestUnread.created_at)} j</b></> : 'aucun en attente', serie: serieDevis, col: 'var(--cms-danger-fg)', href: '/cms/devis' },
    { l: 'Conversion devis → client', v: conversion, sfx: '%', chip: { t: 'neutral' as const, x: `${devisAcceptes}/${devis.length}` }, cmp: <>{devisAcceptes} devis acceptés</>, serie: serieAccept, col: 'var(--cms-ok-fg)', href: '/cms/stats' },
    { l: 'Panier moyen', v: panierMoyen, sfx: ' €', chip: { t: 'neutral' as const, x: `${facturesPayees.length} factures` }, cmp: <>sur les factures payées</>, serie: serieRev, col: 'var(--cms-ok-fg)', href: '/cms/factures' },
    { l: 'Clients actifs', v: clientsActifs, sfx: '', chip: nouveauxMois ? { t: 'up' as const, x: `+${nouveauxMois}` } : { t: 'neutral' as const, x: 'stable' }, cmp: <>{nouveauxMois} nouveau(x) ce mois</>, serie: serieClients, col: 'var(--cms-ok-fg)', href: '/cms/clients' },
  ]

  const funnel = [
    { n: 'Prospects', v: nProspects, w: 100, c: '#B9B1A8', href: '/cms/clients' },
    { n: 'Devis reçus', v: devis.length, w: 78, c: '#8FB4E8', href: '/cms/devis' },
    { n: 'En discussion', v: nDiscussion, w: 52, c: '#E3B968', href: '/cms/devis' },
    { n: 'Devis acceptés', v: devisAcceptes, w: 38, c: 'var(--cms-ok-fg)', href: '/cms/devis' },
    { n: 'Clients actifs', v: clientsActifs, w: 46, c: 'var(--cms-brand)', href: '/cms/clients' },
  ]

  const todo: { dot: string; tt: string; ts: string; href: string }[] = []
  if (devisNonLus.length) todo.push({ dot: 'var(--cms-danger-fg)', tt: `${devisNonLus.length} devis à traiter`, ts: oldestUnread ? `le plus vieux il y a ${joursDepuis(oldestUnread.created_at)} j` : '', href: '/cms/devis' })
  if (facturesRetard.length) todo.push({ dot: 'var(--cms-warn-fg)', tt: `${facturesRetard.length} facture(s) en retard`, ts: `${eur(facturesRetard.reduce((s, f) => s + f.montant_ttc, 0))} à relancer`, href: '/cms/factures' })
  if (aRelancer) todo.push({ dot: 'var(--cms-info-fg)', tt: `${aRelancer} prospect(s) à relancer`, ts: 'jamais contactés', href: '/cms/suivi' })

  const suiviCards = [
    { l: 'Emails envoyés', v: suivi.sent, r: '' },
    { l: 'Ouvertures', v: suivi.open, r: suivi.sent ? `${Math.round((suivi.open / suivi.sent) * 100)}%` : '' },
    { l: 'Clics', v: suivi.click, r: suivi.sent ? `${Math.round((suivi.click / suivi.sent) * 100)}%` : '' },
    { l: 'Appels', v: suivi.call, r: '' }, { l: 'SMS', v: suivi.sms, r: '' }, { l: 'WhatsApp', v: suivi.whatsapp, r: '' },
  ]

  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }
  const cardProps = (extra: string, d: number) => ({ className: `rounded-2xl hovlift rv ${extra}`.trim(), style: { ...cardStyle, animationDelay: `${d}s` } })

  return (
    <div>
      <style>{`
        .rv{opacity:0;transform:translateY(10px);animation:cmsrv .6s cubic-bezier(.2,.9,.3,1) forwards}
        @keyframes cmsrv{to{opacity:1;transform:none}}
        .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:cmsdraw 1.4s ease .3s forwards}
        @keyframes cmsdraw{to{stroke-dashoffset:0}}
        .grow{transform-origin:left;animation:cmsgrow .8s cubic-bezier(.2,.9,.3,1) both}
        @keyframes cmsgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .hovlift{transition:transform .16s,box-shadow .16s}
        .hovlift:hover{transform:translateY(-2px);box-shadow:var(--cms-shadow-hover,0 2px 4px rgb(20 16 12/.05),0 22px 50px -28px rgb(20 16 12/.30))}
        .hovbg{transition:background .14s;border-radius:10px}
        .hovbg:hover{background:var(--cms-surface-2)}
        @media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none}.draw{stroke-dashoffset:0}.grow{animation:none}}
      `}</style>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>
            {greeting}, <span className="cms-accent">Béranger</span> 👋
          </h1>
          <p className="text-sm mt-1 first-letter:uppercase" style={{ color: 'var(--cms-muted)' }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · voici où en est l&apos;activité
          </p>
        </div>
        <Link href="/cms/devis" className="cms-btn cms-btn-primary"><Plus className="w-4 h-4" /> Nouveau devis</Link>
      </div>

      {/* R1 : HERO + jauge */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)' }}>
        <Link href="/cms/factures" {...cardProps('block p-6', .02)}>
          <div className="flex justify-between items-start">
            <span className="cms-eyebrow">Revenu encaissé · ce mois</span>
            <Chip tone={revTrend >= 0 ? 'up' : 'down'}>{revTrend >= 0 ? '+' : ''}{revTrend}% vs mois dernier</Chip>
          </div>
          <div className="font-bold tracking-tight mt-3" style={{ color: 'var(--cms-ink)', fontSize: '3rem', lineHeight: 1 }}>{eur(revAnim)}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>sur un objectif de {eur(OBJECTIF_MENSUEL)}</div>
          <div className="relative mt-3">
            <svg width="100%" height="120" viewBox="0 0 620 120" preserveAspectRatio="none" className="block">
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--cms-brand)" stopOpacity=".18" /><stop offset="1" stopColor="var(--cms-brand)" stopOpacity="0" /></linearGradient></defs>
              <path d={area.area} fill="url(#rev)" />
              <path className="draw" pathLength={1} d={area.line} fill="none" stroke="var(--cms-brand)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {area.end && <circle cx={area.end[0]} cy={area.end[1]} r="4" fill="var(--cms-brand)" />}
            </svg>
            <span className="absolute" style={{ right: 0, top: 2, fontSize: '.66rem', color: 'var(--cms-muted)', background: 'var(--cms-card)', padding: '0 4px' }}>6 derniers mois</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: 'var(--cms-ink-2)' }}>
            <span className="grid place-items-center rounded-lg shrink-0" style={{ width: 22, height: 22, background: 'var(--cms-warn-bg)', color: 'var(--cms-warn-fg)' }}><Clock className="w-3.5 h-3.5" /></span>
            <span><b style={{ color: 'var(--cms-ink)' }}>{eur(enAttenteMontant)}</b> en attente d&apos;encaissement · {enAttente.length} facture(s)</span>
          </div>
        </Link>

        <Link href="/cms/services" {...cardProps('p-5 flex flex-col', .08)}>
          <div className="flex justify-between items-start">
            <span className="cms-eyebrow" style={{ color: 'var(--cms-ink-2)' }}>Objectif du mois</span>
            <Chip tone={revTrend >= 0 ? 'up' : 'down'}>{revTrend >= 0 ? '+' : ''}{revTrend}%</Chip>
          </div>
          <div className="relative mx-auto" style={{ width: 200, height: 112, marginTop: 6 }}>
            <svg width="200" height="112" viewBox="0 0 200 112">
              <path d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke="var(--cms-surface-3)" strokeWidth="16" strokeLinecap="round" />
              <path pathLength={1} d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke="var(--cms-brand)" strokeWidth="16" strokeLinecap="round" style={{ strokeDasharray: `${pct / 100} 1`, strokeDashoffset: 0 }} />
            </svg>
            <div className="absolute text-center" style={{ bottom: 2, left: 0, right: 0 }}>
              <div className="font-bold" style={{ fontSize: '2rem', lineHeight: 1, letterSpacing: '-.04em' }}>{Math.round(pctAnim)}%</div>
              <div style={{ fontSize: '.7rem', color: 'var(--cms-muted)' }}>de l&apos;objectif atteint</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--cms-border)' }}>
            {[['Objectif', eur(OBJECTIF_MENSUEL), 'var(--cms-ink)'], ['Encaissé', eur(revMois), 'var(--cms-brand)'], ['Reste', eur(reste), 'var(--cms-ink)']].map(([l, v, c]) => (
              <div key={l} className="text-center"><div style={{ fontSize: '.64rem', color: 'var(--cms-muted)' }}>{l}</div><div className="font-bold mt-0.5" style={{ fontSize: '.9rem', color: c }}>{v}</div></div>
            ))}
          </div>
        </Link>
      </div>

      {/* KPI */}
      <div className="grid gap-3.5 mb-4" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
        {KPI.map((k, i) => (
          <Link key={k.l} href={k.href} {...cardProps('block p-4', .10 + i * .04)}>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--cms-ink-2)', fontSize: '.76rem' }}>{k.l}</span>
              <Chip tone={k.chip.t}>{k.chip.x}</Chip>
            </div>
            <div className="font-bold tracking-tight" style={{ color: 'var(--cms-ink)', fontSize: '1.85rem', letterSpacing: '-.045em', margin: '9px 0 1px' }}>
              {loading ? '—' : k.v.toLocaleString('fr-FR')}{k.sfx}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--cms-muted)' }}>{k.cmp}</div>
            {!loading && <Spark vals={k.serie} color={k.col} />}
          </Link>
        ))}
      </div>

      {/* R3 : funnel + à faire/agenda */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)' }}>
        <div {...cardProps('', .24)}>
          <div className="flex items-center justify-between px-[18px] py-[15px]" style={{ borderBottom: '1px solid var(--cms-border)' }}>
            <h3 className="font-bold" style={{ fontSize: '.95rem', color: 'var(--cms-ink)' }}>Pipeline de prospection</h3>
            <Link href="/cms/suivi" className="font-semibold" style={{ fontSize: '.74rem', color: 'var(--cms-brand)' }}>Suivi détaillé →</Link>
          </div>
          <div className="p-[18px]">
            <div className="flex flex-col gap-[7px]">
              {funnel.map((f, i) => (
                <Link key={f.n} href={f.href} className="hovbg flex items-center gap-3" style={{ padding: 1 }}>
                  <span style={{ width: 112, fontSize: '.8rem', color: 'var(--cms-ink-2)', paddingLeft: 6, flexShrink: 0 }}>{f.n}</span>
                  <span className="grow flex items-center font-bold text-white" style={{ flex: 1, height: 30, borderRadius: 8, padding: '0 10px', background: f.c, width: `${f.w}%`, fontSize: '.78rem', animationDelay: `${.3 + i * .08}s` }}>{loading ? '' : f.v}</span>
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {suiviCards.map(s => (
                <div key={s.l} className="rounded-xl p-2.5" style={{ border: '1px solid var(--cms-border)' }}>
                  <div style={{ fontSize: '.66rem', color: 'var(--cms-muted)' }}>{s.l}</div>
                  <div className="font-bold mt-0.5" style={{ fontSize: '1.1rem', color: 'var(--cms-ink)' }}>{s.v}{s.r && <span style={{ fontSize: '.62rem', color: 'var(--cms-ok-fg)', fontWeight: 600 }}> {s.r}</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div {...cardProps('', .28)}>
            <div className="px-[18px] py-[15px]" style={{ borderBottom: '1px solid var(--cms-border)' }}>
              <h3 className="font-bold" style={{ fontSize: '.95rem', color: 'var(--cms-ink)' }}>À faire <span className="cms-accent" style={{ color: 'var(--cms-brand)', fontSize: '1rem' }}>en priorité</span></h3>
            </div>
            <div className="px-[18px] py-1.5">
              {todo.length === 0 ? (
                <p className="py-4 text-sm flex items-center gap-2" style={{ color: 'var(--cms-muted)' }}><CheckCircle2 className="w-4 h-4" style={{ color: 'var(--cms-ok-fg)' }} /> Rien d&apos;urgent, tout est à jour.</p>
              ) : todo.map((t, i) => (
                <Link key={i} href={t.href} className="hovbg flex gap-3 items-start" style={{ padding: 10, margin: '0 -10px', borderBottom: i < todo.length - 1 ? '1px solid var(--cms-border)' : 'none' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, marginTop: 5, background: t.dot, flexShrink: 0 }} />
                  <div className="flex-1"><div className="font-semibold" style={{ fontSize: '.82rem', color: 'var(--cms-ink)' }}>{t.tt}</div><div style={{ fontSize: '.72rem', color: 'var(--cms-muted)' }}>{t.ts}</div></div>
                  <ChevronRight className="w-4 h-4 self-center" style={{ color: 'var(--cms-faint)' }} />
                </Link>
              ))}
            </div>
          </div>
          <div {...cardProps('', .32)}>
            <div className="flex items-center justify-between px-[18px] py-[15px]" style={{ borderBottom: '1px solid var(--cms-border)' }}>
              <h3 className="font-bold" style={{ fontSize: '.95rem', color: 'var(--cms-ink)' }}>Agenda du jour</h3>
              <Link href="/cms/agenda" className="font-semibold" style={{ fontSize: '.74rem', color: 'var(--cms-brand)' }}>Agenda →</Link>
            </div>
            <div className="px-[18px] py-2">
              {agenda.length === 0 ? (
                <p className="py-3 text-sm flex items-center gap-2" style={{ color: 'var(--cms-muted)' }}><CalendarDays className="w-4 h-4" /> Aucun rendez-vous aujourd&apos;hui.</p>
              ) : agenda.map((a, i) => (
                <Link key={i} href="/cms/agenda" className="hovbg flex gap-3 items-center" style={{ padding: '9px 10px', margin: '0 -10px', borderBottom: i < agenda.length - 1 ? '1px solid var(--cms-border)' : 'none' }}>
                  <span className="font-bold" style={{ fontSize: '.8rem', color: 'var(--cms-brand)', width: 50, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{a.time}</span>
                  <div><div className="font-semibold" style={{ fontSize: '.81rem', color: 'var(--cms-ink)' }}>{a.title}</div>{a.sub && <div style={{ fontSize: '.71rem', color: 'var(--cms-muted)' }}>{a.sub}</div>}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* R4 : activité + donut */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)' }}>
        <div {...cardProps('', .34)}>
          <div className="flex items-center justify-between px-[18px] py-[15px]" style={{ borderBottom: '1px solid var(--cms-border)' }}>
            <h3 className="font-bold" style={{ fontSize: '.95rem', color: 'var(--cms-ink)' }}>Activité récente</h3>
          </div>
          <div className="px-[18px] py-1.5">
            {loading ? <p className="py-4 text-sm" style={{ color: 'var(--cms-muted)' }}>Chargement…</p>
              : recent.length === 0 ? <p className="py-4 text-sm" style={{ color: 'var(--cms-muted)' }}>Aucune activité pour le moment.</p>
              : recent.map((a, i) => (
                <Link key={a.id} href={a.href} className="hovbg flex gap-3 items-center" style={{ padding: 10, margin: '0 -10px', borderBottom: i < recent.length - 1 ? '1px solid var(--cms-border)' : 'none' }}>
                  <span className="grid place-items-center shrink-0" style={{ width: 30, height: 30, borderRadius: 9, background: a.bg, color: a.fg }}><a.Icon className="w-3.5 h-3.5" /></span>
                  <div className="flex-1 min-w-0"><div className="font-semibold truncate" style={{ fontSize: '.82rem', color: 'var(--cms-ink)' }}>{a.label}</div><div className="truncate" style={{ fontSize: '.71rem', color: 'var(--cms-muted)' }}>{a.sub}</div></div>
                  <span style={{ fontSize: '.71rem', color: 'var(--cms-faint)' }}>{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
          </div>
        </div>
        <div {...cardProps('', .38)}>
          <div className="flex items-center justify-between px-[18px] py-[15px]" style={{ borderBottom: '1px solid var(--cms-border)' }}>
            <h3 className="font-bold" style={{ fontSize: '.95rem', color: 'var(--cms-ink)' }}>CA par service</h3>
            <Link href="/cms/services" className="font-semibold" style={{ fontSize: '.74rem', color: 'var(--cms-brand)' }}>Détail →</Link>
          </div>
          <div className="p-[18px]">
            {donut.length === 0 ? (
              <p className="py-6 text-sm text-center" style={{ color: 'var(--cms-muted)' }}>Pas encore de vente enregistrée.</p>
            ) : (
              <div className="flex items-center gap-4">
                <svg width="108" height="108" viewBox="0 0 42 42" className="shrink-0">
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--cms-surface-3)" strokeWidth="7" />
                  {(() => { let acc = 0; return donut.slice(0, 4).map(([, val], i) => { const frac = donutTotal ? (val / donutTotal) * 100 : 0; const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={DONUT_COLORS[i]} strokeWidth="7" strokeDasharray={`${frac} ${100 - frac}`} strokeDashoffset={25 - acc} transform="rotate(-90 21 21)" />; acc += frac; return el }) })()}
                  <text x="21" y="20" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="var(--cms-ink)">{(donutTotal / 1000).toFixed(1).replace('.', ',')}k€</text>
                  <text x="21" y="26" textAnchor="middle" fontSize="3" fill="var(--cms-muted)">total</text>
                </svg>
                <div className="flex flex-col gap-2 flex-1">
                  {donut.slice(0, 4).map(([name, val], i) => (
                    <div key={name} className="flex items-center gap-2" style={{ fontSize: '.78rem' }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: DONUT_COLORS[i], flexShrink: 0 }} />
                      <span className="truncate" style={{ color: 'var(--cms-ink-2)' }}>{name}</span>
                      <span className="ml-auto font-bold">{donutTotal ? Math.round((val / donutTotal) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ressources */}
      <div className="rv flex items-center gap-2 flex-wrap mt-4 p-3 rounded-2xl" style={{ border: '1px dashed var(--cms-border-2)', animationDelay: '.42s' }}>
        <span style={{ fontSize: '.72rem', color: 'var(--cms-muted)', marginRight: 4 }}><Bell className="w-3.5 h-3.5 inline mr-1" style={{ verticalAlign: '-2px' }} />Raccourcis :</span>
        {[['Supabase', 'https://supabase.com/dashboard', '#16A34A', 'SB'], ['Stripe', 'https://dashboard.stripe.com', '#7C3AED', 'ST'], ['Vercel', 'https://vercel.com/dashboard', '#16130F', '▲']].map(([n, h, c, l]) => (
          <a key={n} href={h} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2" style={{ fontSize: '.76rem', color: 'var(--cms-ink-2)', padding: '6px 11px', borderRadius: 99, border: '1px solid var(--cms-border)' }}>
            <b className="grid place-items-center text-white" style={{ width: 20, height: 20, borderRadius: 6, fontSize: '.6rem', background: c }}>{l}</b>{n}
          </a>
        ))}
      </div>
    </div>
  )
}
