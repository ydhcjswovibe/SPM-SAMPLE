import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {
  LOCAL_RUNTIME_ACCOUNTS,
  createAdminHeaders,
  getRuntimePassword,
  loadLocalEnv,
  requireEnv,
} from './runtime-auth.mjs'

loadLocalEnv()

const PROJECT_ROOT = process.cwd()
const RPC_DOC_PATH = path.join(PROJECT_ROOT, 'docs', 'db', 'RPC.sql')
const MANAGEMENT_API_BASE = 'https://api.supabase.com/v1'
const ZERO_UUID = '00000000-0000-0000-0000-000000000000'

export const REMOTE_CANONICAL_TARGETS = ['enrollment-status', 'payment', 'weekly-notes']

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSupabaseUrl() {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
}

function getSupabaseAnonKey() {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

function getSupabaseServiceRoleKey() {
  return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
}

export function getProjectRef() {
  const url = getSupabaseUrl()
  const match = url.match(/^https:\/\/([^.]+)\.supabase\.co$/)

  if (!match) {
    throw new Error(`Unsupported NEXT_PUBLIC_SUPABASE_URL format: ${url}`)
  }

  return match[1]
}

function normalizeTargets(targets) {
  const requested = Array.isArray(targets) && targets.length > 0 ? targets : REMOTE_CANONICAL_TARGETS
  const normalized = [...new Set(requested)]
  const invalid = normalized.filter((target) => !REMOTE_CANONICAL_TARGETS.includes(target))

  if (invalid.length > 0) {
    throw new Error(`Unsupported remote canonical target: ${invalid.join(', ')}`)
  }

  return normalized
}

function parseTargetArgs(argv = process.argv.slice(2)) {
  const targets = []

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--target') {
      const nextValue = argv[index + 1]
      if (!nextValue) {
        throw new Error('Missing value after --target')
      }

      targets.push(nextValue)
      index += 1
      continue
    }

    if (value.startsWith('--target=')) {
      targets.push(value.slice('--target='.length))
    }
  }

  return normalizeTargets(targets)
}

async function readRpcDoc() {
  return fs.readFile(RPC_DOC_PATH, 'utf8')
}

async function readRpcFunctionSql(name, signature) {
  const source = await readRpcDoc()
  const regex = new RegExp(
    `create or replace function public\\.${escapeRegExp(name)}\\([\\s\\S]*?comment on function public\\.${escapeRegExp(name)}\\(${escapeRegExp(signature)}\\)[\\s\\S]*?;`,
  )
  const match = source.match(regex)

  if (!match) {
    throw new Error(`Failed to extract ${name} helper from docs/db/RPC.sql`)
  }

  return match[0].trim()
}

async function readCanonicalQueriesForTarget(target) {
  switch (target) {
    case 'enrollment-status':
      return [
        {
          label: 'public.update_enrollment_status',
          query: await readRpcFunctionSql('update_enrollment_status', 'uuid, text'),
        },
      ]
    case 'payment':
      return [
        {
          label: 'public.update_enrollment_payment_status',
          query: await readRpcFunctionSql('update_enrollment_payment_status', 'uuid, boolean'),
        },
      ]
    case 'weekly-notes':
      return [
        {
          label: 'public.class_logs.admin_note',
          query: 'alter table public.class_logs add column if not exists admin_note text;',
        },
        {
          label: 'public.upsert_weekly_class_log_notes',
          query: await readRpcFunctionSql(
            'upsert_weekly_class_log_notes',
            'uuid, text, integer, text, text, jsonb, text',
          ),
        },
      ]
    default:
      throw new Error(`Unhandled remote canonical target: ${target}`)
  }
}

async function loginRuntimeAdmin() {
  const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')

  if (!adminAccount) {
    throw new Error('Missing admin runtime account')
  }

  const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: getSupabaseAnonKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminAccount.email,
      password: getRuntimePassword(),
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.access_token) {
    throw new Error(`Failed to login runtime admin for remote probe: ${JSON.stringify(payload)}`)
  }

  return payload.access_token
}

function isMissingRpcResponse(response, payload) {
  return response.status === 404 && payload && typeof payload === 'object' && payload.code === 'PGRST202'
}

async function probeRpc(functionName, body) {
  const accessToken = await loginRuntimeAdmin()
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: getSupabaseAnonKey(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => null)
  const missing = isMissingRpcResponse(response, payload)

  return {
    name: `public.${functionName}`,
    kind: 'rpc',
    status: response.status,
    present: !missing,
    missing,
    body: payload,
  }
}

function isMissingColumnResponse(response, payload, columnName) {
  if (response.ok || !payload || typeof payload !== 'object') {
    return false
  }

  const haystack = [payload.message, payload.details, payload.hint].filter(Boolean).join(' ')
  return haystack.includes(columnName)
}

async function probeColumn(columnName) {
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/class_logs?select=id,${columnName}&limit=1`, {
    headers: createAdminHeaders(getSupabaseServiceRoleKey()),
  })
  const payload = await response.json().catch(() => null)
  const missing = isMissingColumnResponse(response, payload, columnName)

  return {
    name: `public.class_logs.${columnName}`,
    kind: 'column',
    status: response.status,
    present: response.ok,
    missing,
    body: payload,
  }
}

export async function probeEnrollmentStatusRpc() {
  return probeRpc('update_enrollment_status', {
    p_enrollment_id: ZERO_UUID,
    p_status: 'ACTIVE',
  })
}

export async function probePaymentRpc() {
  return probeRpc('update_enrollment_payment_status', {
    p_enrollment_id: ZERO_UUID,
    p_payment_status: true,
  })
}

export async function probeWeeklyNotesRpc() {
  return probeRpc('upsert_weekly_class_log_notes', {
    p_class_id: ZERO_UUID,
    p_year_month: '2099-01',
    p_week_number: 1,
    p_progress: 'probe',
    p_reflection: 'probe',
    p_member_feedback: {},
    p_admin_note: 'probe',
  })
}

export async function probeAdminNoteColumn() {
  return probeColumn('admin_note')
}

export async function verifyRemoteCanonicalPresence(targets) {
  const selectedTargets = normalizeTargets(targets)
  const checks = []

  for (const target of selectedTargets) {
    if (target === 'enrollment-status') {
      checks.push(await probeEnrollmentStatusRpc())
      continue
    }

    if (target === 'payment') {
      checks.push(await probePaymentRpc())
      continue
    }

    if (target === 'weekly-notes') {
      checks.push(await probeAdminNoteColumn())
      checks.push(await probeWeeklyNotesRpc())
    }
  }

  return {
    projectRef: getProjectRef(),
    targets: selectedTargets,
    checks,
  }
}

async function applyQuery(query, accessToken) {
  const response = await fetch(`${MANAGEMENT_API_BASE}/projects/${getProjectRef()}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(`Management API query failed (${response.status}): ${JSON.stringify(payload)}`)
  }

  return payload
}

export async function applyRemoteCanonicalTargets(targets, { dryRun = false } = {}) {
  const selectedTargets = normalizeTargets(targets)
  const queryGroups = []

  for (const target of selectedTargets) {
    queryGroups.push({
      target,
      queries: await readCanonicalQueriesForTarget(target),
    })
  }

  if (dryRun) {
    return {
      dryRun: true,
      projectRef: getProjectRef(),
      targets: selectedTargets,
      queryGroups: queryGroups.map((group) => ({
        target: group.target,
        queries: group.queries.map((entry) => ({
          label: entry.label,
          queryLength: entry.query.length,
          queryPreview: entry.query.slice(0, 160),
        })),
      })),
    }
  }

  const accessToken = requireEnv('SUPABASE_ACCESS_TOKEN')
  const results = []

  for (const group of queryGroups) {
    for (const entry of group.queries) {
      const payload = await applyQuery(entry.query, accessToken)

      results.push({
        target: group.target,
        label: entry.label,
        ok: true,
        result: payload,
      })
    }
  }

  return {
    ok: true,
    projectRef: getProjectRef(),
    targets: selectedTargets,
    results,
  }
}

export function readRemoteCanonicalTargetsFromArgv(argv = process.argv.slice(2)) {
  return parseTargetArgs(argv)
}
