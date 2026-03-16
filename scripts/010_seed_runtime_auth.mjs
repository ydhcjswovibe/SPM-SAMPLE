import {
  LOCAL_RUNTIME_ACCOUNTS,
  createAdminHeaders,
  getRuntimePassword,
  getSupabaseEnv,
  loadLocalEnv,
  readJson,
} from './lib/runtime-auth.mjs'

loadLocalEnv()

const { url, serviceRoleKey } = getSupabaseEnv()
const password = getRuntimePassword()
const headers = createAdminHeaders(serviceRoleKey, {
  'Content-Type': 'application/json',
})

async function listUsers() {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    headers: createAdminHeaders(serviceRoleKey),
  })

  const payload = await readJson(response, 'Failed to list auth users')
  return Array.isArray(payload?.users) ? payload.users : []
}

async function ensureAuthUser(account, users) {
  const existing = users.find((item) => item.email === account.email)

  if (existing) {
    const response = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
        },
      }),
    })

    await readJson(response, `Failed to update auth user: ${account.email}`)
    return { id: existing.id, email: account.email }
  }

  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
      },
    }),
  })

  const payload = await readJson(response, `Failed to create auth user: ${account.email}`)
  return { id: payload.user.id, email: account.email }
}

async function upsertProfiles(rows) {
  const response = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: createAdminHeaders(serviceRoleKey, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(rows),
  })

  return await readJson(response, 'Failed to upsert profiles')
}

async function main() {
  const users = await listUsers()
  const ensured = []

  for (const account of LOCAL_RUNTIME_ACCOUNTS) {
    const user = await ensureAuthUser(account, users)
    ensured.push({
      id: user.id,
      email: account.email,
      role: account.role,
      full_name: account.fullName,
    })
  }

  await upsertProfiles(ensured)

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        passwordConfigured: true,
        accounts: ensured.map((account) => ({
          email: account.email,
          role: account.role,
          full_name: account.full_name,
        })),
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
