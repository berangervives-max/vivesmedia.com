'use client'
import { useEffect } from 'react'
import { track, type FunnelEvent } from '@/lib/analytics'

/**
 * Déclenche un événement funnel au montage — utilisable depuis une page
 * server (ex. page service) pour tracker une vue avec des propriétés riches.
 */
export default function TrackView({ event, props }: { event: FunnelEvent; props?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
