import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { createClient } from '@/lib/supabase/server'

function mapRpcError(message: string) {
  if (message.includes('permission denied')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (message.includes('enrollment not found')) {
    return { error: 'ENROLLMENT_NOT_FOUND', status: 404 }
  }

  return { error: 'PAYMENT_UPDATE_FAILED', status: 500 }
}

export async function POST(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as
    | { enrollmentId?: string; paymentStatus?: 'paid' | 'unpaid' }
    | null

  if (!body?.enrollmentId || !body.paymentStatus) {
    return NextResponse.json({ error: 'INVALID_PAYMENT_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('update_enrollment_payment_status', {
      p_enrollment_id: body.enrollmentId,
      p_payment_status: body.paymentStatus === 'paid',
    })

    if (error) {
      const mapped = mapRpcError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Payment update failed:', error)
    return NextResponse.json({ error: 'PAYMENT_UPDATE_FAILED' }, { status: 500 })
  }
}
