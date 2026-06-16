import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getGscPages } from '@/lib/google-data'

// Stats Search Console par article (clics / impressions / position), indexées par chemin. Admin only.
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const rows = await getGscPages(200)
  const stats: Record<string, { clicks: number; impressions: number; position: number }> = {}
  for (const r of rows) {
    const path = (r.keys[0] || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '')
    stats[path] = { clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10 }
  }
  return NextResponse.json({ stats })
}
