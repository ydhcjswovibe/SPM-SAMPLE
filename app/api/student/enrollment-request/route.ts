import { type NextRequest, NextResponse } from 'next/server'

import { isStudentRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { isValidYearMonth } from '@/lib/admin/matrix'
import { createAdminClient } from '@/lib/supabase/admin'
import type { EnrollmentLifecycleStatus } from '@/lib/types'

type RequestableClassRow = {
  id: string
  name: string | null
  is_active?: boolean | null
}

type EnrollmentRow = {
  id: string
  class_id: string
  student_id: string
  year_month: string
  payment_status: boolean | null
  status: EnrollmentLifecycleStatus
}

function getRequestError(code: string) {
  switch (code) {
    case 'AUTH_REQUIRED':
      return { error: 'AUTH_REQUIRED', status: 401 }
    case 'STUDENT_REQUIRED':
      return { error: 'STUDENT_REQUIRED', status: 403 }
    case 'INVALID_YEAR_MONTH':
      return { error: 'INVALID_YEAR_MONTH', status: 400 }
    case 'INVALID_ENROLLMENT_INPUT':
      return { error: 'INVALID_ENROLLMENT_INPUT', status: 400 }
    case 'CLASS_NOT_FOUND':
      return { error: 'CLASS_NOT_FOUND', status: 404 }
    case 'ENROLLMENT_ALREADY_ACTIVE':
      return { error: 'ENROLLMENT_ALREADY_ACTIVE', status: 409 }
    case 'ENROLLMENT_ALREADY_PENDING':
      return { error: 'ENROLLMENT_ALREADY_PENDING', status: 409 }
    default:
      return { error: code, status: 500 }
  }
}

async function requireStudentAccess() {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated || !access.userId) {
    return getRequestError('AUTH_REQUIRED')
  }

  if (!isStudentRole(access.role)) {
    return getRequestError('STUDENT_REQUIRED')
  }

  return { access }
}

export async function GET(request: NextRequest) {
  const accessResult = await requireStudentAccess()
  if ('error' in accessResult) {
    return NextResponse.json({ error: accessResult.error }, { status: accessResult.status })
  }

  const yearMonth = request.nextUrl.searchParams.get('yearMonth')
  if (!yearMonth || !isValidYearMonth(yearMonth)) {
    const failure = getRequestError('INVALID_YEAR_MONTH')
    return NextResponse.json({ error: failure.error }, { status: failure.status })
  }

  try {
    const supabase = createAdminClient()
    const [{ data: classRows, error: classError }, { data: enrollmentRows, error: enrollmentError }] =
      await Promise.all([
        supabase.from('classes').select('id, name, is_active').eq('is_active', true).order('name', {
          ascending: true,
        }),
        supabase
          .from('enrollments')
          .select('id, class_id, student_id, year_month, payment_status, status')
          .eq('student_id', accessResult.access.userId)
          .eq('year_month', yearMonth),
      ])

    if (classError || enrollmentError) {
      return NextResponse.json({ error: 'REQUESTABLE_CLASSES_READ_FAILED' }, { status: 500 })
    }

    const statusByClassId = new Map(
      ((enrollmentRows ?? []) as EnrollmentRow[]).map((row) => [row.class_id, row.status]),
    )

    const normalized = ((classRows ?? []) as RequestableClassRow[]).map((row) => ({
      id: row.id,
      name: row.name ?? '이름 없는 수업',
      existingStatus: statusByClassId.get(row.id) ?? null,
    }))

    return NextResponse.json({ data: normalized })
  } catch (error) {
    console.error('Student requestable class read failed:', error)
    return NextResponse.json({ error: 'REQUESTABLE_CLASSES_READ_FAILED' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const accessResult = await requireStudentAccess()
  if ('error' in accessResult) {
    return NextResponse.json({ error: accessResult.error }, { status: accessResult.status })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        classId?: string
        yearMonth?: string
      }
    | null

  if (!body?.classId || !body.yearMonth) {
    const failure = getRequestError('INVALID_ENROLLMENT_INPUT')
    return NextResponse.json({ error: failure.error }, { status: failure.status })
  }

  if (!isValidYearMonth(body.yearMonth)) {
    const failure = getRequestError('INVALID_YEAR_MONTH')
    return NextResponse.json({ error: failure.error }, { status: failure.status })
  }

  try {
    const supabase = createAdminClient()
    const { data: classRow, error: classError } = await supabase
      .from('classes')
      .select('id, name, is_active')
      .eq('id', body.classId)
      .eq('is_active', true)
      .maybeSingle()

    if (classError) {
      return NextResponse.json({ error: 'ENROLLMENT_REQUEST_FAILED' }, { status: 500 })
    }

    const normalizedClassRow = (classRow ?? null) as RequestableClassRow | null

    if (!normalizedClassRow) {
      const failure = getRequestError('CLASS_NOT_FOUND')
      return NextResponse.json({ error: failure.error }, { status: failure.status })
    }

    const { data: existingRow, error: existingError } = await supabase
      .from('enrollments')
      .select('id, class_id, student_id, year_month, payment_status, status')
      .eq('class_id', body.classId)
      .eq('student_id', accessResult.access.userId)
      .eq('year_month', body.yearMonth)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: 'ENROLLMENT_REQUEST_FAILED' }, { status: 500 })
    }

    const normalizedExistingRow = (existingRow ?? null) as EnrollmentRow | null

    if (normalizedExistingRow?.status === 'ACTIVE') {
      const failure = getRequestError('ENROLLMENT_ALREADY_ACTIVE')
      return NextResponse.json({ error: failure.error }, { status: failure.status })
    }

    if (normalizedExistingRow?.status === 'PENDING') {
      const failure = getRequestError('ENROLLMENT_ALREADY_PENDING')
      return NextResponse.json({ error: failure.error }, { status: failure.status })
    }

    if (normalizedExistingRow?.status === 'CANCELLED') {
      const { data, error } = await supabase
        .from('enrollments')
        .update({
          status: 'PENDING',
          payment_status: false,
        })
        .eq('id', normalizedExistingRow.id)
        .select('id, class_id, student_id, year_month, payment_status, status')
        .single()

      if (error) {
        return NextResponse.json({ error: 'ENROLLMENT_REQUEST_FAILED' }, { status: 500 })
      }

      return NextResponse.json({
        data: data as EnrollmentRow,
        meta: {
          className: normalizedClassRow.name ?? '이름 없는 수업',
          reopened: true,
        },
      })
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        class_id: body.classId,
        student_id: accessResult.access.userId,
        year_month: body.yearMonth,
        payment_status: false,
        status: 'PENDING',
      })
      .select('id, class_id, student_id, year_month, payment_status, status')
      .single()

    if (error) {
      if (error.message.includes('duplicate key value')) {
        return NextResponse.json({ error: 'ENROLLMENT_ALREADY_PENDING' }, { status: 409 })
      }

      return NextResponse.json({ error: 'ENROLLMENT_REQUEST_FAILED' }, { status: 500 })
    }

    return NextResponse.json({
      data: data as EnrollmentRow,
      meta: {
        className: normalizedClassRow.name ?? '이름 없는 수업',
        reopened: false,
      },
    })
  } catch (error) {
    console.error('Student enrollment request failed:', error)
    return NextResponse.json({ error: 'ENROLLMENT_REQUEST_FAILED' }, { status: 500 })
  }
}
