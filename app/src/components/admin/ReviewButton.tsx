'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

export default function ReviewButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleClick() {
    if (!confirm("Envoyer un email de demande d'avis Google à ce client ?")) return
    setLoading(true)
    try {
      const res = await fetch(`/hub/api/admin/projects/${projectId}/review`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      setSent(true)
      toast.success("Email d'avis Google envoyé au client !")
    } catch {
      toast.error("Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading || sent}
      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:cursor-default"
      style={sent ? { background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' } : { background: 'var(--cms-warn-bg)', color: 'var(--cms-warn-fg)' }}>
      <Star className="w-4 h-4" />
      {sent ? 'Avis envoyé' : loading ? 'Envoi...' : 'Demander un avis Google'}
    </button>
  )
}
