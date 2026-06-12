import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getGscData, getGa4Data } from '@/lib/google-data'

// Données GA4 + Search Console pour le back-office. Admin uniquement.
export async function GET() {
  // Projet Supabase partagé avec le Hub → on vérifie l'email admin, pas juste "authentifié"
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const [gsc, ga4] = await Promise.all([getGscData(), getGa4Data()])
    return NextResponse.json({ gsc, ga4, generatedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur récupération données', detail: String(e) }, { status: 500 })
  }
}
