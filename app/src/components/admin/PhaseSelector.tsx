'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PHASE_LABELS, PHASE_ORDER, type ProjectPhase } from '@/types/hub'

export default function PhaseSelector({ projectId, currentPhase, clientEmail }: {
  projectId: string; currentPhase: ProjectPhase; clientEmail: string; clientName?: string; projectName?: string
}) {
  const [selected, setSelected] = useState<ProjectPhase>(currentPhase)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const hasChanged = selected !== currentPhase

  async function handleUpdate() {
    if (!hasChanged) return
    setLoading(true)
    try {
      const res = await fetch(`/hub/api/admin/projects/${projectId}/phase`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: selected, note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      toast.success(`Projet passé en phase ${PHASE_LABELS[selected]}`)
      setNote('')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px] space-y-2">
          <Label className="text-xs text-muted-foreground">Changer la phase</Label>
          <select value={selected} onChange={(e) => setSelected(e.target.value as ProjectPhase)}
            className="w-full h-9 text-sm text-foreground bg-card border border-border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            {PHASE_ORDER.map((phase) => <option key={phase} value={phase}>{PHASE_LABELS[phase]}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px] space-y-2">
          <Label className="text-xs text-muted-foreground">Note (optionnel)</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Message pour le client…" className="h-9" />
        </div>
        <Button onClick={handleUpdate} disabled={!hasChanged || loading} size="sm" className="h-9 rounded-full px-5">
          {loading ? 'Mise à jour…' : 'Valider'}
        </Button>
      </div>
      {hasChanged && <p className="text-xs text-muted-foreground">Un email sera envoyé à {clientEmail} pour notifier le changement.</p>}
    </div>
  )
}
