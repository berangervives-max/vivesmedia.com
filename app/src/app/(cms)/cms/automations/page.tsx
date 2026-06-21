import { createServiceClient } from '@/lib/supabase'
import { AUTOMATIONS } from '@/lib/automations'
import AutomationsBoard from '@/components/cms/AutomationsBoard'

export const dynamic = 'force-dynamic'

export default async function AutomationsPage() {
  const meta = AUTOMATIONS.map(({ id, onglet, cible, label, desc, cadence }) => ({ id, onglet, cible, label, desc, cadence }))

  let logs: { type: string; payload: Record<string, unknown> | null; created_at: string }[] = []
  try {
    const sb = createServiceClient()
    const { data } = await sb.from('automation_logs').select('type,payload,created_at').order('created_at', { ascending: false }).limit(60)
    logs = data ?? []
  } catch { /* table pas encore créée */ }

  const lastRun: Record<string, string> = {}
  for (const l of logs) if (!lastRun[l.type]) lastRun[l.type] = l.created_at

  return <AutomationsBoard meta={meta} lastRun={lastRun} journal={logs.slice(0, 30)} />
}
