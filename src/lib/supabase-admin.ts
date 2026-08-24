import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// SERVER-SIDE ONLY — do not import in client components.

let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
    )
  }

  if (!client) {
    client = createClient(url, key)
  }

  return client
}
