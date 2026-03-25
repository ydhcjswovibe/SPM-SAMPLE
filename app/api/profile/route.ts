import { type NextRequest, NextResponse } from 'next/server'

import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated || !access.userId) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { fullName?: string | null } | null
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null })
      .eq('id', access.userId)
      .select('id, email, role, full_name, avatar_url')
      .single()

    if (error) {
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
      }

      return NextResponse.json({ error: 'PROFILE_UPDATE_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('profile', 'PROFILE_UPDATE_FAILED', error, {
      userId: access.userId,
    })
    return NextResponse.json({ error: 'PROFILE_UPDATE_FAILED' }, { status: 500 })
  }
}
