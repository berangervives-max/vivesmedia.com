'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { newsletterService } from '@/services/supabase.service'
import type { Newsletter } from '@/types'
import { Download, Mail, Send } from 'lucide-react'

export default function CmsNewsletterPage() {
  const [subs, setSubs] = useState<Newsletter[]>([])
  useEffect(() => { newsletterService.getAll().then(setSubs).catch(() => {}) }, [])

  const exportCSV = () => {
    const csv = ['Email,Date inscription,Actif', ...subs.map(s => `${s.email},${new Date(s.date_inscription).toLocaleDateString('fr-FR')},${s.actif}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'newsletter.csv'; a.click()
  }

  const actifs = subs.filter(s => s.actif).length
  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="cms-eyebrow">Marketing</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Newsletter</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>
            <b style={{ color: 'var(--cms-ok-fg)' }}>{actifs} abonné(s) actif(s)</b>{subs.length > actifs && ` · ${subs.length - actifs} désabonné(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="cms-btn cms-btn-secondary cms-btn-sm"><Download className="w-4 h-4" /> Exporter CSV</button>
          <Link href="/cms/campagnes" className="cms-btn cms-btn-primary"><Send className="w-4 h-4" /> Envoyer une campagne</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total inscrits', value: subs.length, color: 'var(--cms-info-fg)' },
          { label: 'Actifs', value: actifs, color: 'var(--cms-ok-fg)' },
          { label: 'Désabonnés', value: subs.length - actifs, color: 'var(--cms-muted)' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={cardStyle}>
            <p className="text-2xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cms-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
        <table className="w-full text-sm" style={{ minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--cms-border)', background: 'var(--cms-surface-2)' }}>
              {['Email', 'Date inscription', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--cms-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && <tr><td colSpan={3} className="text-center py-12 text-sm" style={{ color: 'var(--cms-muted)' }}>Aucun abonné</td></tr>}
            {subs.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < subs.length - 1 ? '1px solid var(--cms-border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-muted)' }} /><span className="font-medium" style={{ color: 'var(--cms-ink)' }}>{s.email}</span></div></td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--cms-faint)' }}>{new Date(s.date_inscription).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3"><span className="cms-badge" style={s.actif ? { background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' } : { background: 'var(--cms-surface-2)', color: 'var(--cms-muted)' }}>{s.actif ? 'Actif' : 'Désabonné'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
