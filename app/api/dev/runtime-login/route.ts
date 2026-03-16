import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { getDefaultRouteForRole, normalizeUserRole } from '@/lib/auth/roles'

const LOCAL_RUNTIME_PRESETS = [
  { preset: 'OWNER', email: 'o@spm.local' },
  { preset: 'ADMIN', email: 'a@spm.local' },
  { preset: 'STUDENT', email: 's1@spm.local' },
] as const

function isLocalRuntimeRequest(request: Request) {
  const { hostname } = new URL(request.url)
  return hostname === '127.0.0.1' || hostname === 'localhost'
}

type RuntimeCookie = {
  name: string
  value: string
  options: CookieOptions
}

export async function POST(request: Request) {
  if (!isLocalRuntimeRequest(request)) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        email?: string
        password?: string
        preset?: 'OWNER' | 'ADMIN' | 'STUDENT'
      }
    | null

  const preset = body?.preset
  const presetAccount = LOCAL_RUNTIME_PRESETS.find((item) => item.preset === preset)
  const email = (presetAccount?.email ?? body?.email)?.trim().toLowerCase() ?? ''
  const password = presetAccount ? process.env.LOCAL_RUNTIME_AUTH_PASSWORD?.trim() || 'spm-local-pass-2026!' : body?.password ?? ''

  if (!email.endsWith('@spm.local') || !password) {
    return NextResponse.json({ error: 'INVALID_RUNTIME_LOGIN' }, { status: 400 })
  }

  let cookiesToSet: RuntimeCookie[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ?.split(';')
            .map((cookie) => cookie.trim())
            .filter(Boolean)
            .map((cookie) => {
              const separatorIndex = cookie.indexOf('=')
              return {
                name: cookie.slice(0, separatorIndex),
                value: cookie.slice(separatorIndex + 1),
              }
            }) ?? []
        },
        setAll(nextCookies) {
          cookiesToSet = nextCookies
        },
      },
    },
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: 'INVALID_RUNTIME_LOGIN' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', data.user.id)
    .maybeSingle()

  const role = normalizeUserRole(profile?.role)
  const response = NextResponse.json({
    data: {
      email: profile?.email ?? data.user.email ?? null,
      fullName:
        profile?.full_name ??
        (typeof data.user.user_metadata?.full_name === 'string' ? data.user.user_metadata.full_name : null),
      role,
      redirectTo: getDefaultRouteForRole(role),
    },
  })

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
