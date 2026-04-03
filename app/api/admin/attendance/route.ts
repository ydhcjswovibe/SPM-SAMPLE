import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'

function normalizeOperatorAttendanceStatus(value: unknown) {
  if (value === 'present') {
    return 'present' as const
  }

  if (value === 'absent' || value === 'pending' || value === 'excused') {
    return 'absent' as const
  }

  return null
}

function mapRpcError(message: string) {
  if (message.includes('permission denied')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (message.includes('session not found')) {
    return { error: 'SESSION_NOT_FOUND', status: 404 }
  }

  if (message.includes('class_log not found')) {
    return { error: 'CLASS_LOG_NOT_FOUND', status: 404 }
  }

  if (message.includes('invalid attendance status')) {
    return { error: 'INVALID_ATTENDANCE_INPUT', status: 400 }
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
        sessionId?: string
        classLogId?: string
        studentId?: string
        status?: 'present' | 'absent' | 'pending' | 'excused'
      }
    | null

  if ((!body?.sessionId && !body?.classLogId) || !body.studentId || !body.status) {
    return NextResponse.json({ error: 'INVALID_ATTENDANCE_INPUT' }, { status: 400 })
  }

  const normalizedStatus = normalizeOperatorAttendanceStatus(body.status)
  if (!normalizedStatus) {
    return NextResponse.json({ error: 'INVALID_ATTENDANCE_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const rpcName = body.sessionId ? 'upsert_session_attendance_status' : 'update_attendance_status'
    const rpcArgs = body.sessionId
      ? {
          p_session_id: body.sessionId,
          p_student_id: body.studentId,
          p_status: normalizedStatus,
        }
      : {
          p_class_log_id: body.classLogId,
          p_student_id: body.studentId,
          p_attended: normalizedStatus === 'present',
        }

    const { data, error } = await supabase.rpc(rpcName, rpcArgs)

    if (error) {
      const mapped = mapRpcError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.attendance', 'ATTENDANCE_UPDATE_FAILED', error)
    return NextResponse.json({ error: 'ATTENDANCE_UPDATE_FAILED' }, { status: 500 })
  }
}
