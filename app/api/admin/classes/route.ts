import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole, isOwnerRole } from '@/lib/auth/roles'
import { isValidYearMonth } from '@/lib/admin/matrix'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'

function mapCreateClassError(message: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'OWNER_REQUIRED', status: 403 }
  }

  return { error: 'CLASS_CREATE_FAILED', status: 500 }
}

function mapDeleteClassError(message: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'OWNER_REQUIRED', status: 403 }
  }

  if (message.includes('invalid input syntax')) {
    return { error: 'CLASS_NOT_FOUND', status: 404 }
  }

  return { error: 'CLASS_DELETE_FAILED', status: 500 }
}

export async function GET(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const yearMonth = request.nextUrl.searchParams.get('yearMonth')

  if (yearMonth && !isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    if (yearMonth) {
      const { data: enrollmentRows, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('class_id')
        .eq('year_month', yearMonth)

      if (enrollmentError) {
        return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
      }

      const enrolledClassIds = new Set(
        (enrollmentRows ?? []).map((row) => row.class_id).filter((value): value is string => Boolean(value)),
      )

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
      }

      const sorted = [...(data ?? [])].sort((left, right) => {
        const leftRank = enrolledClassIds.has(left.id) ? 0 : 1
        const rightRank = enrolledClassIds.has(right.id) ? 0 : 1

        if (leftRank !== rightRank) {
          return leftRank - rightRank
        }

        return left.name.localeCompare(right.name, 'ko')
      })

      return NextResponse.json({ data: sorted })
    }

    const { data, error } = await supabase
      .from('classes')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_LIST_READ_FAILED', error, {
      yearMonth,
    })
    return NextResponse.json({ error: 'CLASS_LIST_READ_FAILED' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isOwnerRole(access.role)) {
    return NextResponse.json({ error: 'OWNER_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null
  const name = body?.name?.trim()

  if (!name) {
    return NextResponse.json({ error: 'CLASS_NAME_REQUIRED' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name,
      })
      .select('id, name, is_active')
      .single()

    if (error) {
      const mapped = mapCreateClassError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_CREATE_FAILED', error)
    return NextResponse.json({ error: 'CLASS_CREATE_FAILED' }, { status: 500 })
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

  const body = (await request.json().catch(() => null)) as { classId?: string } | null

  if (!body?.classId) {
    return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('classes')
      .update({ is_active: false })
      .eq('id', body.classId)
      .eq('is_active', true)
      .select('id, name, is_active')
      .maybeSingle()

    if (error) {
      const mapped = mapDeleteClassError(error.message)
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    if (!data) {
      return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.classes', 'CLASS_DELETE_FAILED', error, {
      classId: body.classId,
    })
    return NextResponse.json({ error: 'CLASS_DELETE_FAILED' }, { status: 500 })
  }
}
