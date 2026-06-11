import { NextRequest, NextResponse } from 'next/server'
import { newsletterService } from '@/services/supabase.service'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    await newsletterService.subscribe(email)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
