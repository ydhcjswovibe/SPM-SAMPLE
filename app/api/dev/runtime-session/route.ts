import { NextResponse } from 'next/server'

import { isLocalRuntimeHostname } from '@/lib/env/server'
import { readServerAccessContext } from '@/lib/auth/server'

function isLocalRuntimeRequest(request: Request) {
  const { hostname } = new URL(request.url)
  return isLocalRuntimeHostname(hostname)
}

export async function GET(request: Request) {
  if (!isLocalRuntimeRequest(request)) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const access = await readServerAccessContext()
  return NextResponse.json({ data: access })
}
