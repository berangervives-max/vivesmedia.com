'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Zap, Clock, FileText, Receipt, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'

const ORANGE = '#F4521E'

type AutomationLog = {
  id: string
  type: string
  payload: Record<string, unknown> | null
  created_at: string
}

const AUTOMATIONS = [
  {
    type: 'follow_up',
    icon: FileText,
    label: 'Relance devis abandonnés',
    desc: 'Tous les 2 jours à 10h — repère les devis non lus depuis 48h et déclenche une relance.',
    cadence: 'Tous les 2 jours · 10h00',
  },
  {
    type: 'overdue_alert',
    icon: Receipt,
    label: 'Alerte factures impayées',
    desc: 'Chaque jour — passe en "en retard" les factures dont l\'échéance est dépassée et te notifie.',
    cadence: 'Quotidien',
  },
  {
    type: 'monthly_report',
    icon: TrendingUp,
    label: 'Rapport mensuel de revenus',
    desc: 'Le 1er du mois — calcule le CA encaissé du mois précédent et l\'archive dans le journal.',
    cadence: 'Le 1er du mois',
  },
]

const TYPE_LABELS: Record<string, string> = {
  follow_up: 'Relance devis',
  overdue_alert: 'Factures impayées',
  monthly_report: 'Rapport mensuel',
}

export default function AutomationsPage() {
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [tablesReady, setTablesReady] = useState<boolean | null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.from('automation_logs').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data, error }) => {
        if (error) { setTablesReady(false); return }
        setTablesReady(true)
        setLogs((data ?? []) as AutomationLog[])
      })
  }, [])

  return (
    <div className="space-y-6">

      {/* Statut global */}
      {tablesReady === false && (
        <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
          <p className="text-sm" style={{ color: '#92400E' }}>
            Les automatisations seront actives après l'exécution du script SQL (<code>002_automations.sql</code> — pg_cron) dans Supabase.
          </p>
        </div>
      )}
      {tablesReady === true && (
        <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#16A34A' }} />
          <p className="text-sm" style={{ color: '#166534' }}>
            Journal des automatisations connecté — {logs.length} exécution{logs.length > 1 ? 's' : ''} enregistrée{logs.length > 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* Les 3 automatisations */}
      <div className="grid sm:grid-cols-3 gap-4">
        {AUTOMATIONS.map(a => {
          const lastRun = logs.find(l => l.type === a.type)
          return (
            <div key={a.type} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,82,30,.1)', color: ORANGE }}>
                  <a.icon className="w-4 h-4" />
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ background: '#F8F9FA', color: '#6B7280', border: '1px solid #F1F3F5' }}>
                  <Clock className="w-2.5 h-2.5" /> {a.cadence}
                </span>
              </div>
              <p className="text-sm font-bold mb-1.5" style={{ color: '#111827' }}>{a.label}</p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#9CA3AF' }}>{a.desc}</p>
              <p className="text-[11px] pt-3" style={{ color: '#9CA3AF', borderTop: '1px solid #F1F3F5' }}>
                Dernière exécution :{' '}
                <strong style={{ color: lastRun ? '#16A34A' : '#9CA3AF' }}>
                  {lastRun ? new Date(lastRun.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais'}
                </strong>
              </p>
            </div>
          )
        })}
      </div>

      {/* Journal */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Journal des exécutions</h2>
        </div>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Les 50 dernières actions automatiques</p>

        {logs.length === 0 ? (
          <div className="h-40 rounded-lg flex flex-col items-center justify-center gap-2"
            style={{ background: '#F8F9FA', border: '1px dashed #E5E7EB' }}>
            <Zap className="w-6 h-6" style={{ color: '#D1D5DB' }} />
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune exécution pour le moment — les automatisations tournent toutes seules une fois le SQL activé</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F1F3F5' }}>
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#16A34A' }} />
                <span className="text-sm font-medium w-44 shrink-0" style={{ color: '#111827' }}>
                  {TYPE_LABELS[log.type] ?? log.type}
                </span>
                <span className="text-xs flex-1 truncate font-mono" style={{ color: '#9CA3AF' }}>
                  {log.payload ? JSON.stringify(log.payload).slice(0, 80) : '—'}
                </span>
                <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>
                  {new Date(log.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
