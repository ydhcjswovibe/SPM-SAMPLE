import { isLocalRuntimeHostname } from '@/lib/env/shared'

const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
const PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? ''

export function getPublicSupabaseEnv() {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required public Supabase env')
  }

  return {
    url: PUBLIC_SUPABASE_URL,
    anonKey: PUBLIC_SUPABASE_ANON_KEY,
  }
}

export function getPublicGoogleClientId() {
  return PUBLIC_GOOGLE_CLIENT_ID
}

export { isLocalRuntimeHostname }
