import 'server-only'

type LogMeta = Record<string, unknown>

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
  }
}

export function logApiError(route: string, code: string, error: unknown, meta: LogMeta = {}) {
  console.error(`[api:${route}] ${code}`, {
    ...meta,
    error: normalizeError(error),
  })
}

export function logApiWarning(route: string, code: string, meta: LogMeta = {}) {
  console.warn(`[api:${route}] ${code}`, meta)
}
