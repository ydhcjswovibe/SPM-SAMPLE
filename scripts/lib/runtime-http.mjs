import { getRuntimePassword, loadLocalEnv, readJson } from './runtime-auth.mjs'

loadLocalEnv()

export function resolveBaseUrl() {
  return process.env.SPM_BASE_URL?.trim() || 'http://127.0.0.1:3000'
}

export class CookieJar {
  constructor() {
    this.cookies = new Map()
  }

  apply(response) {
    const setCookie = response.headers.getSetCookie?.() ?? []
    for (const entry of setCookie) {
      const [pair] = entry.split(';')
      const separatorIndex = pair.indexOf('=')
      if (separatorIndex === -1) continue
      const name = pair.slice(0, separatorIndex)
      const value = pair.slice(separatorIndex + 1)
      this.cookies.set(name, value)
    }
  }

  header() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }
}

export async function request(baseUrl, path, init = {}, jar) {
  const headers = new Headers(init.headers ?? {})
  if (jar?.header()) {
    headers.set('cookie', jar.header())
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    redirect: 'manual',
  })

  jar?.apply(response)
  return response
}

export async function loginAs(baseUrl, account) {
  const jar = new CookieJar()
  const response = await request(
    baseUrl,
    '/api/dev/runtime-login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: account.email,
        password: getRuntimePassword(),
      }),
    },
    jar,
  )

  const payload = await readJson(response, `Failed to login as ${account.email}`)
  return { jar, payload }
}

export async function readJsonOrNull(response) {
  return await response.json().catch(() => null)
}
