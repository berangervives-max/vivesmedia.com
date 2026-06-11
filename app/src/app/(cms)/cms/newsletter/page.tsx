'use client'
import { useState, useEffect } from 'react'
import { newsletterService } from '@/services/supabase.service'
import type { Newsletter } from '@/types'
import { Download, Mail } from 'lucide-react'

export default function CmsNewsletterPage() {
  const [subs, setSubs] = useState<Newsletter[]>([])
  useEffect(() => { newsletterService.getAll().then(setSubs).catch(() => {}) }, [])

  const exportCSV = () => {
    const csv = ['Email,Date inscription,Actif', ...subs.map(s => `${s.email},${new Date(s.date_inscription).toLocaleDateString('fr-FR')},${s.actif}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'newsletter.csv'; a.click()
  }

  const actifs = subs.filter(s => s.actif).length

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Newsletter</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>{actifs} abonné(s) actif(s)</span>
            {subs.length > actifs && ` · ${subs.length - actifs} désabonné(s)`}
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total inscrits', value: subs.length, color: '#3B82F6' },
          { label: 'Actifs', value: actifs, color: '#10B981' },
          { label: 'Désabonnés', value: subs.length - actifs, color: '#9CA3AF' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              {['Email', 'Date inscription', 'Statut'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={3} className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Aucun abonné</td></tr>
            )}
            {subs.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < subs.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: '#9CA3AF' }} />
                    <span className="font-medium" style={{ color: '#111827' }}>{s.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>
                  {new Date(s.date_inscription).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.actif ? 'Actif' : 'Désabonné'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
