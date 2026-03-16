import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { isValidYearMonth } from '@/lib/admin/matrix'
import type { EnrollmentLifecycleStatus } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

type EnrollmentProfileRow =
  | {
      id: string
      email: string | null
      full_name: string | null
    }
  | {
      id: string
      email: string | null
      full_name: string | null
    }[]
  | null

type EnrollmentListRow = {
  id: string
  class_id: string
  student_id: string
  year_month: string
  payment_status: boolean | null
  status: EnrollmentLifecycleStatus
  profiles: EnrollmentProfileRow
}

function mapEnrollmentError(message: string, fallback: string, deniedError: 'ADMIN_REQUIRED' | 'OWNER_REQUIRED') {
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return { error: deniedError, status: 403 }
  }

  if (message.includes('duplicate key value')) {
    return { error: 'ENROLLMENT_ALREADY_EXISTS', status: 409 }
  }

  if (message.includes('invalid enrollment status')) {
    return { error: 'INVALID_ENROLLMENT_STATUS', status: 400 }
  }

  if (message.includes('enrollment not found')) {
    return { error: 'ENROLLMENT_NOT_FOUND', status: 404 }
  }

  return { error: fallback, status: 500 }
}

function isValidEnrollmentStatus(status: unknown): status is EnrollmentLifecycleStatus {
  return status === 'ACTIVE' || status === 'PENDING' || status === 'CANCELLED'
}

function isMissingEnrollmentStatusRpc(message: string, code?: string) {
  return (
    code === 'PGRST202' ||
    message.includes('Could not find the function public.update_enrollment_status') ||
    message.includes('schema cache')
  )
}

export async function GET(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const classId = request.nextUrl.searchParams.get('classId')
  const yearMonth = request.nextUrl.searchParams.get('yearMonth')

  if (!classId || !yearMonth) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_INPUT' }, { status: 400 })
  }

  if (!isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
          id,
          class_id,
          student_id,
          year_month,
          payment_status,
          status,
          profiles!enrollments_student_id_fkey (
            id,
            email,
            full_name
          )
        `,
      )
      .eq('class_id', classId)
      .eq('year_month', yearMonth)

    if (error) {
      const mapped = mapEnrollmentError(error.message, 'ENROLLMENT_READ_FAILED', 'ADMIN_REQUIRED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    const normalized = ((data ?? []) as EnrollmentListRow[])
      .map((item) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? (item.profiles[0] ?? null) : item.profiles,
      }))
      .filter(
        (
          item,
        ): item is EnrollmentListRow & {
          profiles: {
            id: string
            email: string | null
            full_name: string | null
          }
        } => Boolean(item.profiles),
      )
      .sort((left, right) => {
        const leftRank = left.status === 'ACTIVE' ? 0 : left.status === 'PENDING' ? 1 : 2
        const rightRank = right.status === 'ACTIVE' ? 0 : right.status === 'PENDING' ? 1 : 2
        if (leftRank !== rightRank) return leftRank - rightRank
        return (left.profiles.full_name || '').localeCompare(right.profiles.full_name || '', 'ko')
      })

    return NextResponse.json({ data: normalized })
  } catch (error) {
    console.error('Enrollment read failed:', error)
    return NextResponse.json({ error: 'ENROLLMENT_READ_FAILED' }, { status: 500 })
  }
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
        classId?: string
        studentId?: string
        yearMonth?: string
        status?: EnrollmentLifecycleStatus
      }
    | null

  if (!body?.classId || !body.studentId || !body.yearMonth) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_INPUT' }, { status: 400 })
  }

  if (!isValidYearMonth(body.yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  const nextStatus = body.status ?? 'ACTIVE'
  if (!isValidEnrollmentStatus(nextStatus)) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_STATUS' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        class_id: body.classId,
        student_id: body.studentId,
        year_month: body.yearMonth,
        payment_status: false,
        status: nextStatus,
      })
      .select('id, class_id, student_id, year_month, payment_status, status')
      .single()

    if (error) {
      const mapped = mapEnrollmentError(error.message, 'ENROLLMENT_CREATE_FAILED', 'ADMIN_REQUIRED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Enrollment create failed:', error)
    return NextResponse.json({ error: 'ENROLLMENT_CREATE_FAILED' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        enrollmentId?: string
        status?: EnrollmentLifecycleStatus
      }
    | null

  if (!body?.enrollmentId || !body.status) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_INPUT' }, { status: 400 })
  }

  if (!isValidEnrollmentStatus(body.status)) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_STATUS' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    let { data, error } = await supabase.rpc('update_enrollment_status', {
      p_enrollment_id: body.enrollmentId,
      p_status: body.status,
    })

    if (error && isMissingEnrollmentStatusRpc(error.message, error.code)) {
      // Connected Supabase projects can lag behind the optional helper; keep the same route contract.
      const fallback = await supabase
        .from('enrollments')
        .update({ status: body.status })
        .eq('id', body.enrollmentId)
        .select('id, class_id, student_id, year_month, payment_status, status')
        .maybeSingle()

      data = fallback.data
      error = fallback.error

      if (!error && !data) {
        return NextResponse.json({ error: 'ENROLLMENT_NOT_FOUND' }, { status: 404 })
      }
    }

    if (error) {
      const mapped = mapEnrollmentError(error.message, 'ENROLLMENT_STATUS_UPDATE_FAILED', 'ADMIN_REQUIRED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Enrollment status update failed:', error)
    return NextResponse.json({ error: 'ENROLLMENT_STATUS_UPDATE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as { enrollmentId?: string } | null

  if (!body?.enrollmentId) {
    return NextResponse.json({ error: 'INVALID_ENROLLMENT_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', body.enrollmentId)
      .select('id')
      .maybeSingle()

    if (error) {
      const mapped = mapEnrollmentError(error.message, 'ENROLLMENT_DELETE_FAILED', 'OWNER_REQUIRED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    if (!data) {
      return NextResponse.json({ error: 'ENROLLMENT_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enrollment delete failed:', error)
    return NextResponse.json({ error: 'ENROLLMENT_DELETE_FAILED' }, { status: 500 })
  }
}
