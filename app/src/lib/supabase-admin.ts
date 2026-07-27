// Client Supabase service_role (serveur uniquement) pour l'espace client rapatrié :
// URL signées de téléchargement, opérations admin. NON typé (voir supabase-server.ts).
import { createClient } from '@supabase/supabase-js'

export function createAdminSupabase() {
  if (typeof window !== 'undefined') throw new Error('createAdminSupabase ne doit jamais être appelé côté client')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
