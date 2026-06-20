import { NextRequest, NextResponse } from 'next/server'
import { newsletterService } from '@/services/supabase.service'

export async function POST(req: NextRequest) {
  try {
    const { email, website } = await req.json()
    // Honeypot anti-bot : champ piège rempli → succès simulé, aucune inscription
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true })
    }
    if (!email || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    await newsletterService.subscribe(email)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
