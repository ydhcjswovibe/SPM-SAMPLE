import { type NextRequest, NextResponse } from 'next/server'

import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'
import { isValidYearMonth } from '@/lib/admin/matrix'
import { isValidWeekNumber } from '@/lib/weekly-media'

function trimNullableText(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export async function PATCH(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (access.role !== 'STUDENT') {
    return NextResponse.json({ error: 'STUDENT_REQUIRED' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        classId?: string
        yearMonth?: string
        weekNumber?: number
        replyText?: string | null
      }
    | null

  if (!body?.classId || !body.yearMonth || !isValidYearMonth(body.yearMonth) || !isValidWeekNumber(body.weekNumber ?? 0)) {
    return NextResponse.json({ error: 'INVALID_REPLY_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const { data: enrollmentRow, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('class_id', body.classId)
      .eq('year_month', body.yearMonth)
      .eq('student_id', access.userId)
      .in('status', ['ACTIVE', 'PENDING'])
      .maybeSingle()

    if (enrollmentError) {
      return NextResponse.json({ error: 'REPLY_SAVE_FAILED' }, { status: 500 })
    }

    if (!enrollmentRow) {
      return NextResponse.json({ error: 'REPLY_TARGET_NOT_FOUND' }, { status: 404 })
    }

    const replyText = trimNullableText(body.replyText)

    if (!replyText) {
      const { error: deleteError } = await supabase
        .from('student_week_feedback_replies')
        .delete()
        .eq('class_id', body.classId)
        .eq('student_id', access.userId)
        .eq('year_month', body.yearMonth)
        .eq('week_number', body.weekNumber!)

      if (deleteError) {
        return NextResponse.json({ error: 'REPLY_SAVE_FAILED' }, { status: 500 })
      }

      return NextResponse.json({ data: { replyText: null } })
    }

    const { data, error } = await supabase
      .from('student_week_feedback_replies')
      .upsert(
        {
          class_id: body.classId,
          student_id: access.userId,
          year_month: body.yearMonth,
          week_number: body.weekNumber,
          reply_text: replyText,
        },
        {
          onConflict: 'class_id,student_id,year_month,week_number',
        },
      )
      .select('reply_text')
      .single()

    if (error) {
      return NextResponse.json({ error: 'REPLY_SAVE_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ data: { replyText: data.reply_text ?? null } })
  } catch (error) {
    logApiError('student.weekly-feedback-reply', 'REPLY_SAVE_FAILED', error)
    return NextResponse.json({ error: 'REPLY_SAVE_FAILED' }, { status: 500 })
  }
}
