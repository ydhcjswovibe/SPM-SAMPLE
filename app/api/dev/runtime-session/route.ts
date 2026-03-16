import { NextResponse } from 'next/server'

import { readServerAccessContext } from '@/lib/auth/server'

function isLocalRuntimeRequest(request: Request) {
  const { hostname } = new URL(request.url)
  return hostname === '127.0.0.1' || hostname === 'localhost'
}

export async function GET(request: Request) {
  if (!isLocalRuntimeRequest(request)) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const access = await readServerAccessContext()
  return NextResponse.json({ data: access })
}
