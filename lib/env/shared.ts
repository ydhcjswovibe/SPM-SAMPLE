export const DEFAULT_LOCAL_RUNTIME_AUTH_PASSWORD = 'spm-local-pass-2026!'

const LOCAL_RUNTIME_HOSTNAMES = new Set(['127.0.0.1', 'localhost'])

function readRawEnv(name: string) {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function readRequiredEnv(name: string) {
  const value = readRawEnv(name)

  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }

  return value
}

export function readOptionalEnv(name: string) {
  return readRawEnv(name)
}

export function isLocalRuntimeHostname(hostname: string | null | undefined) {
  return hostname ? LOCAL_RUNTIME_HOSTNAMES.has(hostname) : false
}
