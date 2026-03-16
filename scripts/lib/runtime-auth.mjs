import fs from 'node:fs'
import path from 'node:path'

export const LOCAL_RUNTIME_ACCOUNTS = [
  { label: 'OWNER', email: 'o@spm.local', role: 'OWNER', fullName: '서비스 오너' },
  { label: 'ADMIN', email: 'a@spm.local', role: 'ADMIN', fullName: '매트릭스 관리자' },
  { label: 'STUDENT', email: 's1@spm.local', role: 'STUDENT', fullName: '학생1' },
]

export const DEFAULT_LOCAL_RUNTIME_PASSWORD = 'spm-local-pass-2026!'
export const RUNTIME_QA_CLASS_ID = '11111111-1111-4111-8111-111111111111'
export const RUNTIME_QA_YEAR_MONTH = '2026-03'

export function loadLocalEnv(cwd = process.cwd()) {
  const envPath = path.join(cwd, '.env.local')
  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const matched = line.match(/^([^#=]+)=(.*)$/)
    if (!matched) continue

    const key = matched[1].trim()
    if (!key || process.env[key]) continue

    let value = matched[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }

  return value
}

export function getRuntimePassword() {
  return process.env.LOCAL_RUNTIME_AUTH_PASSWORD?.trim() || DEFAULT_LOCAL_RUNTIME_PASSWORD
}

export function getSupabaseEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  }
}

export function createAdminHeaders(serviceRoleKey, extraHeaders = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders,
  }
}

export async function readJson(response, fallbackMessage) {
  const payload = await response.json().catch(() => null)
  if (response.ok) return payload

  const message =
    payload?.msg ||
    payload?.message ||
    payload?.error_description ||
    payload?.error ||
    fallbackMessage ||
    `Request failed: ${response.status}`

  throw new Error(message)
}
