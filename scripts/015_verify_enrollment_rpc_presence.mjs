import {
  LOCAL_RUNTIME_ACCOUNTS,
  getRuntimePassword,
  getSupabaseEnv,
  loadLocalEnv,
} from './lib/runtime-auth.mjs'

loadLocalEnv()

const adminAccount = LOCAL_RUNTIME_ACCOUNTS.find((account) => account.role === 'ADMIN')

if (!adminAccount) {
  throw new Error('Missing admin runtime account')
}

async function main() {
  const { url, anonKey } = getSupabaseEnv()

  const loginResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminAccount.email,
      password: getRuntimePassword(),
    }),
  })

  const loginPayload = await loginResponse.json().catch(() => null)
  if (!loginResponse.ok || !loginPayload?.access_token) {
    throw new Error(`Failed to login runtime admin for RPC check: ${JSON.stringify(loginPayload)}`)
  }

  const rpcResponse = await fetch(`${url}/rest/v1/rpc/update_enrollment_status`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${loginPayload.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_enrollment_id: '00000000-0000-0000-0000-000000000000',
      p_status: 'ACTIVE',
    }),
  })

  const rpcPayload = await rpcResponse.json().catch(() => null)
  const missing =
    rpcResponse.status === 404 &&
    rpcPayload &&
    typeof rpcPayload === 'object' &&
    rpcPayload.code === 'PGRST202'

  console.log(
    JSON.stringify(
      {
        status: rpcResponse.status,
        present: !missing,
        missing,
        body: rpcPayload,
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
