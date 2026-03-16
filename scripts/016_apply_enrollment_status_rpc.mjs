import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { loadLocalEnv } from './lib/runtime-auth.mjs'

loadLocalEnv()

const PROJECT_ROOT = process.cwd()
const RPC_DOC_PATH = path.join(PROJECT_ROOT, 'docs', 'db', 'RPC.sql')
const MANAGEMENT_API_BASE = 'https://api.supabase.com/v1'

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  const match = url.match(/^https:\/\/([^.]+)\.supabase\.co$/)
  if (!match) {
    throw new Error(`Unsupported NEXT_PUBLIC_SUPABASE_URL format: ${url}`)
  }

  return match[1]
}

async function readEnrollmentStatusHelperSql() {
  const source = await fs.readFile(RPC_DOC_PATH, 'utf8')
  const match = source.match(
    /create or replace function public\.update_enrollment_status\([\s\S]*?comment on function public\.update_enrollment_status\(uuid, text\)[\s\S]*?;/,
  )

  if (!match) {
    throw new Error('Failed to extract update_enrollment_status helper from docs/db/RPC.sql')
  }

  return match[0].trim()
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const projectRef = getProjectRef()
  const query = await readEnrollmentStatusHelperSql()

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          projectRef,
          queryPreview: query.slice(0, 160),
          queryLength: query.length,
        },
        null,
        2,
      ),
    )
    return
  }

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Missing SUPABASE_ACCESS_TOKEN')
  }

  const response = await fetch(`${MANAGEMENT_API_BASE}/projects/${projectRef}/database/query`, {
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

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectRef,
        result: payload,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
