import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!, // Uniquement pour les opérations backend
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}