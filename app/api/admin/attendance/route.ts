import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { createClient } from '@/lib/supabase/server'

function mapRpcError(message: string) {
  if (message.includes('permission denied')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (message.includes('class_log not found')) {
    return { error: 'CLASS_LOG_NOT_FOUND', status: 404 }
  }

  return { error: 'ATTENDANCE_UPDATE_FAILED', status: 500 }
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
    | {
        classLogId?: string
        studentId?: string
        status?: 'present' | 'absent' | 'pending'
      }
    | null

  if (!body?.classLogId || !body.studentId || !body.status) {
    return NextResponse.json({ error: 'INVALID_ATTENDANCE_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const rpcName = body.status === 'pending' ? 'clear_attendance_status' : 'update_attendance_status'
    const rpcArgs =
      body.status === 'pending'
        ? {
            p_class_log_id: body.classLogId,
            p_student_id: body.studentId,
          }
        : {
            p_class_log_id: body.classLogId,
            p_student_id: body.studentId,
            p_attended: body.status === 'present',
          }

    const { data, error } = await supabase.rpc(rpcName, rpcArgs)

    if (error) {
      const mapped = mapRpcError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Attendance update failed:', error)
    return NextResponse.json({ error: 'ATTENDANCE_UPDATE_FAILED' }, { status: 500 })
  }
}
