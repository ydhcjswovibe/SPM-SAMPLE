import 'server-only'

import {
  DEFAULT_LOCAL_RUNTIME_AUTH_PASSWORD,
  isLocalRuntimeHostname,
  readOptionalEnv,
  readRequiredEnv,
} from '@/lib/env/shared'

function isProductionLikeEnvironment() {
  const nodeEnv = readOptionalEnv('NODE_ENV')
  const vercelEnv = readOptionalEnv('VERCEL_ENV')

  return nodeEnv === 'production' || vercelEnv === 'preview' || vercelEnv === 'production'
}

export function getSupabaseServerEnv() {
  return {
    url: readRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: readRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

export function getSupabaseAdminEnv() {
  return {
    ...getSupabaseServerEnv(),
    serviceRoleKey: readRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  }
}

export function getLocalRuntimeAuthPassword() {
  return readOptionalEnv('LOCAL_RUNTIME_AUTH_PASSWORD') || DEFAULT_LOCAL_RUNTIME_AUTH_PASSWORD
}

export function assertServerEnvReady() {
  if (!isProductionLikeEnvironment()) {
    return
  }

  getSupabaseServerEnv()
}

export { isLocalRuntimeHostname }
