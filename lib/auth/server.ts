import { cache } from 'react'

import { normalizeUserRole, type AppRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export interface ServerAccessContext {
  isAuthenticated: boolean
  userId: string | null
  email: string | null
  fullName: string | null
  role: AppRole | null
}

export async function readServerAccessContext(): Promise<ServerAccessContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      isAuthenticated: false,
      userId: null,
      email: null,
      fullName: null,
      role: null,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    isAuthenticated: true,
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null) ??
      (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null),
    role: normalizeUserRole(profile?.role),
  }
}

export const getServerAccessContext = cache(readServerAccessContext)
