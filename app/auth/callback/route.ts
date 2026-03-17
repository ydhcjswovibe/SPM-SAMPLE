import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getPostLoginRoute, normalizeUserRole } from '@/lib/auth/roles'

type AuthCookie = {
  name: string
  value: string
  options: CookieOptions
}

function getRedirectBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost) {
    return `${forwardedProto ?? 'https'}://${forwardedHost}`
  }

  return request.nextUrl.origin
}

function buildErrorResponse(request: NextRequest, cookiesToSet: AuthCookie[], message: string) {
  const url = new URL('/auth/error', getRedirectBaseUrl(request))
  url.searchParams.set('message', message)

  const response = NextResponse.redirect(url)
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const requestedPath = request.nextUrl.searchParams.get('next')
  const authErrorDescription =
    request.nextUrl.searchParams.get('error_description') ?? request.nextUrl.searchParams.get('error')

  if (authErrorDescription) {
    return buildErrorResponse(request, [], authErrorDescription)
  }

  if (!code) {
    return buildErrorResponse(request, [], '로그인 콜백 코드가 없습니다')
  }

  let cookiesToSet: AuthCookie[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(nextCookies) {
          cookiesToSet = nextCookies
        },
      },
    },
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return buildErrorResponse(request, cookiesToSet, exchangeError.message)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return buildErrorResponse(request, cookiesToSet, '로그인 세션을 확인할 수 없습니다')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = normalizeUserRole(profile?.role)

  if (!role) {
    return buildErrorResponse(request, cookiesToSet, '프로필 역할을 확인할 수 없습니다')
  }

  const redirectUrl = new URL(getPostLoginRoute(role, requestedPath), getRedirectBaseUrl(request))
  const response = NextResponse.redirect(redirectUrl)

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
