'use client'
import { useState, useEffect, useRef } from 'react'
import { socialPostsService } from '@/services/supabase.service'
import type { SocialPost, SocialPlateforme, SocialFormat, SocialStatut } from '@/types'
import Kpis from '@/components/cms/Kpis'
import VoiceInput from '@/components/cms/VoiceInput'
import { Plus, Trash2, Briefcase, Camera, CalendarClock, Send, Clock, CheckCircle2, X, Link as LinkIcon, Hash, ChevronLeft, ChevronRight } from 'lucide-react'

// lucide v1 n'a pas d'icônes de marque → on mappe : LinkedIn = Briefcase (pro), Instagram = Camera.
const LinkedinIcon = Briefcase
const InstagramIcon = Camera

// ── Helpers calendrier (semaine du lundi au dimanche) ──
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
function mondayOf(d: Date) { const x = new Date(d); const off = (x.getDay() + 6) % 7; x.setDate(x.getDate() - off); x.setHours(0, 0, 0, 0); return x }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

const EMPTY: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'> = {
  plateforme: 'linkedin', format: 'carrousel', titre: '', legende: '', hashtags: '', lien: '', visuel_url: '',
  date_prevue: new Date().toISOString().slice(0, 10), heure: '09:00', statut: 'idee',
}

// Dimensions/format recommandés du visuel par type (le « bon format »).
const FORMAT_DIMS: Record<SocialFormat, string> = {
  carrousel: '1080×1350 px (portrait 4:5) ou 1080×1080 (carré)',
  reel: '1080×1920 px (vertical 9:16) · vidéo < 60 s',
  reel_grille: '1080×1920 px (9:16) · vidéo < 60 s',
  post: '1080×1350 px (4:5) ou 1080×1080 (carré)',
  story: '1080×1920 px (9:16)',
  story_alaune: '1080×1920 px (9:16)',
  video: '1920×1080 px (paysage 16:9) ou 1080×1080 (carré)',
}

const PLATEFORMES: { v: SocialPlateforme; label: string }[] = [{ v: 'linkedin', label: 'LinkedIn' }, { v: 'instagram', label: 'Instagram' }]
const FORMATS: Record<SocialPlateforme, { v: SocialFormat; label: string }[]> = {
  linkedin: [{ v: 'carrousel', label: 'Carrousel (PDF)' }, { v: 'post', label: 'Post texte' }, { v: 'video', label: 'Vidéo' }],
  instagram: [
    { v: 'reel', label: 'Reel (vidéo, hors grille)' },
    { v: 'reel_grille', label: 'Reel affiché sur la grille' },
    { v: 'post', label: 'Post image (grille)' },
    { v: 'carrousel', label: 'Carrousel d\'images (grille)' },
    { v: 'story', label: 'Story (lien cliquable)' },
    { v: 'story_alaune', label: 'Story à la une (permanente)' },
  ],
}
const STATUTS: { v: SocialStatut; label: string; cls: string; dot: string }[] = [
  { v: 'idee', label: 'Idée', cls: 'bg-gray-100 text-gray-600', dot: '#9CA3AF' },
  { v: 'a_valider', label: 'À valider', cls: 'bg-amber-100 text-amber-700', dot: '#D97706' },
  { v: 'planifie', label: 'Planifié', cls: 'bg-blue-100 text-blue-700', dot: '#2563EB' },
  { v: 'publie', label: 'Publié', cls: 'bg-green-100 text-green-700', dot: '#16A34A' },
]
const statutMeta = (s: SocialStatut) => STATUTS.find(x => x.v === s) || STATUTS[0]

// Conseils inline tirés du playbook STRATEGIE_SOCIALE_2026.md
const TIPS: Record<SocialFormat, string> = {
  carrousel: 'Slide 1 = hook fort · 1 idée/slide · dernière slide = 1 seul CTA · lien en légende/commentaire (pas dans le PDF).',
  reel: '< 60 s · 9:16 · hook dans les 3 premières secondes · sous-titres · CTA « DM-moi SITE ». Découverte (+36 % reach).',
  reel_grille: 'Même règles qu\'un Reel, mais gardé sur la grille du profil → preuve d\'activité visible. Réglage à la publication.',
  post: 'Image soignée (vitrine/réalisation) · hook en 1re ligne · 1 idée · finir par une question.',
  story: 'Le SEUL format Instagram avec lien cliquable → sticker « Lien » vers une page de conversion. + sticker sondage/question.',
  story_alaune: 'Story épinglée en « À la une » = menu permanent du profil (Réalisations, Avis, Tarifs, Contact). Le visiteur froid s\'y renseigne.',
  video: 'Vidéo native (sous-titres, hook 3 s). Sur LinkedIn, garde-la courte et orientée valeur.',
}

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }
const labelCls = 'text-xs font-semibold block mb-1.5 uppercase tracking-wide'
const labelStyle = { color: '#6B7280' }

export default function CmsSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const [view, setView] = useState<'calendrier' | 'feed'>('calendrier')

  const load = () => socialPostsService.getAll().then(setPosts).catch(e => setErr(e.message?.includes('social_posts') ? 'table_absente' : e.message))
  useEffect(() => { load() }, [])

  // À l'arrivée des posts : si la semaine affichée est vide, sauter à la semaine
  // qui contient le prochain post planifié (sinon le calendrier paraît « vide »).
  const jumped = useRef(false)
  useEffect(() => {
    if (jumped.current || !posts.length) return
    const dated = posts.map(p => p.date_prevue).filter((d): d is string => !!d).sort()
    if (!dated.length) { jumped.current = true; return }
    const ws = ymd(weekStart), we = ymd(addDays(weekStart, 6))
    if (!dated.some(d => d >= ws && d <= we)) {
      const today = ymd(new Date())
      const next = dated.find(d => d >= today) || dated[0]
      setWeekStart(mondayOf(new Date(next + 'T00:00:00')))
    }
    jumped.current = true
  }, [posts, weekStart])

  const open = (p?: SocialPost) => {
    setEditing(p?.id || 'new')
    setForm(p ? {
      plateforme: p.plateforme, format: p.format, titre: p.titre, legende: p.legende, hashtags: p.hashtags,
      lien: p.lien, visuel_url: p.visuel_url, date_prevue: p.date_prevue, heure: p.heure || '09:00', statut: p.statut,
    } : { ...EMPTY })
  }

  const openAt = (date: string, plat: SocialPlateforme) => {
    setEditing('new')
    setForm({ ...EMPTY, date_prevue: date, plateforme: plat, format: FORMATS[plat][0].v })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') await socialPostsService.create(form)
      else if (editing) await socialPostsService.update(editing, form)
      setEditing(null); load()
    } catch (e2) { alert('Erreur : ' + (e2 as Error).message) }
    finally { setSaving(false) }
  }
  const del = async (id: string) => { if (!confirm('Supprimer ce post ?')) return; await socialPostsService.delete(id); load() }

  // KPIs RÉELS, calculés sur les posts chargés
  const now = Date.now(), week = now + 7 * 864e5
  const planifSemaine = posts.filter(p => p.statut === 'planifie' && p.date_prevue && new Date(p.date_prevue).getTime() >= now && new Date(p.date_prevue).getTime() < week).length
  const aValider = posts.filter(p => p.statut === 'a_valider').length
  const li = posts.filter(p => p.plateforme === 'linkedin').length
  const ig = posts.filter(p => p.plateforme === 'instagram').length

  if (err === 'table_absente') return (
    <div className="rounded-xl p-8 max-w-2xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
      <h1 className="text-lg font-bold mb-2" style={{ color: '#92400E' }}>Onglet Réseaux sociaux — 1 étape à faire</h1>
      <p className="text-sm mb-3" style={{ color: '#92400E' }}>La table <code>social_posts</code> n&apos;existe pas encore. Ouvre <b>Supabase → SQL Editor</b>, colle le contenu du fichier <code>supabase/social_posts.sql</code> du projet, clique <b>Run</b>, puis recharge cette page.</p>
      <p className="text-xs" style={{ color: '#B45309' }}>C&apos;est la seule étape manuelle (création de la table). Ensuite tout fonctionne.</p>
    </div>
  )

  if (editing) return (
    <form onSubmit={save} className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{editing === 'new' ? 'Nouveau post' : 'Modifier le post'}</h1>
        <button type="button" onClick={() => setEditing(null)} className="p-2 rounded-lg" style={{ border: '1px solid #E5E7EB' }}><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-4 rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Plateforme</label>
            <select value={form.plateforme} onChange={e => { const pf = e.target.value as SocialPlateforme; setForm(p => ({ ...p, plateforme: pf, format: FORMATS[pf][0].v })) }} className={inputCls} style={inputStyle}>
              {PLATEFORMES.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Format</label>
            <select value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value as SocialFormat }))} className={inputCls} style={inputStyle}>
              {FORMATS[form.plateforme].map(f => <option key={f.v} value={f.v}>{f.label}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs rounded-lg p-2.5" style={{ background: '#F0F9FF', color: '#0369A1' }}>💡 {TIPS[form.format]}</p>
        <div>
          <label className={labelCls} style={labelStyle}>Titre interne (repère)</label>
          <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} className={inputCls} style={inputStyle} placeholder="Ex : Carrousel « 5 erreurs sur votre site »" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls + ' mb-0'} style={labelStyle}>Légende</label>
            <VoiceInput onResult={t => setForm(p => ({ ...p, legende: t }))} label="Dicter la légende" />
          </div>
          <textarea value={form.legende} onChange={e => setForm(p => ({ ...p, legende: e.target.value }))} rows={6} className={inputCls} style={inputStyle} placeholder="Accroche en 1re ligne… puis valeur… puis une question." />
          <p className="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>{form.legende.length} caractères {form.plateforme === 'linkedin' ? '(LinkedIn : viser 800-1200)' : ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}><Hash className="inline w-3 h-3" /> Hashtags</label>
            <input value={form.hashtags} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} className={inputCls} style={inputStyle} placeholder={form.plateforme === 'linkedin' ? '#WebVaucluse #SiteInternet (3-5 max)' : '#avignon #créationsite (3-8)'} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}><LinkIcon className="inline w-3 h-3" /> Lien {form.plateforme === 'instagram' && form.format !== 'story' ? '(à mettre en story / bio)' : ''}</label>
            <input value={form.lien} onChange={e => setForm(p => ({ ...p, lien: e.target.value }))} className={inputCls} style={inputStyle} placeholder="https://vivesmedia.com/realisations" />
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Visuel (URL image/vidéo)</label>
          <input value={form.visuel_url} onChange={e => setForm(p => ({ ...p, visuel_url: e.target.value }))} className={inputCls} style={inputStyle} placeholder="Colle l'URL du visuel généré (vérifié par visual-qc)" />
          <p className="text-[11px] mt-1" style={{ color: '#0369A1' }}>📐 Format recommandé : <b>{FORMAT_DIMS[form.format]}</b></p>
          {form.visuel_url ? <img src={form.visuel_url} alt="" className="mt-2 rounded-lg max-h-44 object-cover" /> : null}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Date prévue</label>
            <input type="date" value={form.date_prevue || ''} onChange={e => setForm(p => ({ ...p, date_prevue: e.target.value || null }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Heure</label>
            <input type="time" value={form.heure || ''} onChange={e => setForm(p => ({ ...p, heure: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value as SocialStatut }))} className={inputCls} style={inputStyle}>
              {STATUTS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50" style={{ background: '#F4521E' }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>Annuler</button>
        {editing && editing !== 'new' && (
          <button type="button" onClick={() => { del(editing); setEditing(null) }} className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ border: '1px solid #FECACA', color: '#DC2626' }}>
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        )}
      </div>
    </form>
  )

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Réseaux sociaux</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Calendrier éditorial LinkedIn + Instagram — visuels, légendes, liens, hashtags.</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouveau post
        </button>
      </div>

      <Kpis items={[
        { label: 'À valider', value: aValider, icon: Clock, color: '#D97706' },
        { label: 'Planifiés cette semaine', value: planifSemaine, icon: CalendarClock, color: '#2563EB' },
        { label: 'LinkedIn', value: li, icon: LinkedinIcon, color: '#0A66C2' },
        { label: 'Instagram', value: ig, icon: InstagramIcon, color: '#C13584' },
        { label: 'Publiés', value: posts.filter(p => p.statut === 'publie').length, icon: CheckCircle2, color: '#16A34A' },
      ]} />

      {/* Sélecteur de vue */}
      <div className="inline-flex rounded-lg p-0.5 mb-4" style={{ background: '#F1F3F5' }}>
        {([['calendrier', '📅 Calendrier'], ['feed', '🟣 Feed Instagram']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} className="text-xs font-semibold px-3 py-1.5 rounded-md transition"
            style={view === v ? { background: '#fff', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,.06)' } : { color: '#6B7280' }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'calendrier' && (<>
      {/* Navigation de semaine */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-lg" style={{ border: '1px solid #E5E7EB' }} title="Semaine précédente"><ChevronLeft className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
        <p className="text-sm font-semibold" style={{ color: '#111827' }}>
          Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setWeekStart(mondayOf(new Date()))} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>Aujourd&apos;hui</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-lg" style={{ border: '1px solid #E5E7EB' }} title="Semaine suivante"><ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
        </div>
      </div>

      {/* Calendrier : jours en lignes, plateformes en colonnes */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E9ECEF' }}>
        <div className="grid" style={{ gridTemplateColumns: '64px 1fr 1fr', background: '#F8F9FA', borderBottom: '1px solid #E9ECEF' }}>
          <div className="p-2.5" />
          <div className="p-2.5 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#0A66C2', borderLeft: '1px solid #E9ECEF' }}><LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn</div>
          <div className="p-2.5 flex items-center gap-1.5 text-xs font-bold" style={{ color: '#C13584', borderLeft: '1px solid #E9ECEF' }}><InstagramIcon className="w-3.5 h-3.5" /> Instagram</div>
        </div>
        {DAYS.map((dlabel, i) => {
          const day = addDays(weekStart, i)
          const ds = ymd(day)
          const isToday = ds === ymd(new Date())
          const cell = (plat: SocialPlateforme) => (
            <div className="p-2 space-y-1 group" style={{ borderLeft: '1px solid #E9ECEF', minHeight: 60 }}>
              {posts.filter(p => p.date_prevue === ds && p.plateforme === plat).sort((a, b) => (a.heure || '').localeCompare(b.heure || '')).map(p => {
                const sm = statutMeta(p.statut)
                return (
                  <button key={p.id} onClick={() => open(p)} className="w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:shadow-sm transition" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
                    {p.visuel_url
                      ? <img src={p.visuel_url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                      : <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sm.dot }} />}
                    {p.heure ? <span className="text-[10px] font-semibold shrink-0" style={{ color: '#9CA3AF' }}>{p.heure}</span> : null}
                    <span className="text-[11px] truncate" style={{ color: '#374151' }}>{p.titre || p.format}</span>
                  </button>
                )
              })}
              <button onClick={() => openAt(ds, plat)} className="w-full text-[11px] py-1 rounded-md opacity-0 group-hover:opacity-100 transition" style={{ color: '#9CA3AF', border: '1px dashed #E5E7EB' }}>+ ajouter</button>
            </div>
          )
          return (
            <div key={dlabel} className="grid" style={{ gridTemplateColumns: '64px 1fr 1fr', borderBottom: i < 6 ? '1px solid #F1F3F5' : 'none', background: isToday ? '#FFF7F4' : '#fff' }}>
              <div className="p-2.5 flex flex-col justify-center">
                <span className="text-xs font-bold" style={{ color: isToday ? '#F4521E' : '#111827' }}>{dlabel}</span>
                <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{day.getDate()}</span>
              </div>
              {cell('linkedin')}
              {cell('instagram')}
            </div>
          )
        })}
      </div>

      {/* Posts sans date ou hors de la semaine affichée */}
      {(() => {
        const weekDates = new Set(DAYS.map((_, i) => ymd(addDays(weekStart, i))))
        const others = posts.filter(p => !p.date_prevue || !weekDates.has(p.date_prevue))
        if (!others.length) return null
        return (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>À planifier (sans date ou hors semaine) — {others.length}</p>
            <div className="flex flex-wrap gap-2">
              {others.map(p => {
                const sm = statutMeta(p.statut)
                const Plat = p.plateforme === 'linkedin' ? LinkedinIcon : InstagramIcon
                return (
                  <button key={p.id} onClick={() => open(p)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:shadow-sm transition" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
                    <Plat className="w-3 h-3" style={{ color: p.plateforme === 'linkedin' ? '#0A66C2' : '#C13584' }} />
                    <span className="truncate max-w-[160px]" style={{ color: '#374151' }}>{p.titre || p.format}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}
      </>)}

      {view === 'feed' && (() => {
        const grid = posts
          .filter(p => p.plateforme === 'instagram' && ['post', 'carrousel', 'reel_grille'].includes(p.format))
          .sort((a, b) => (b.date_prevue || '').localeCompare(a.date_prevue || '') || (b.heure || '').localeCompare(a.heure || ''))
        return (
          <div>
            <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>Aperçu de ta grille Instagram (posts, carrousels et reels affichés sur la grille). Les stories et reels masqués n&apos;y figurent pas. Du plus récent au plus ancien.</p>
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-1">
                {grid.length === 0 && <div className="col-span-3 text-center text-sm py-12 rounded-lg" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>Aucun post de grille pour l&apos;instant.</div>}
                {grid.map(p => (
                  <button key={p.id} onClick={() => open(p)} className="relative aspect-square overflow-hidden hover:opacity-90 transition" style={{ background: '#F1F3F5' }}>
                    {p.visuel_url
                      ? <img src={p.visuel_url} alt="" className="w-full h-full object-cover" />
                      : <span className="absolute inset-0 flex items-center justify-center text-[10px] px-1.5 text-center leading-tight" style={{ color: '#9CA3AF' }}>{p.titre || p.format}</span>}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] mt-3 max-w-md mx-auto text-center" style={{ color: '#9CA3AF' }}>💡 Cherche la cohérence : alterne les types (citation / réalisation / conseil), garde la même palette et la même lumière (voir DA Station). Une grille harmonieuse = un profil qui inspire confiance.</p>
          </div>
        )
      })()}

      <p className="text-xs mt-5 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
        <Send className="w-3 h-3" /> Astuce : sur Instagram, seule la <b>story</b> permet un lien cliquable — planifie 1 story/semaine vers une page de conversion.
      </p>
    </div>
  )
}
