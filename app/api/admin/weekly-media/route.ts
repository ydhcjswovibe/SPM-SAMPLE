import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError, logApiWarning } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'
import {
  getPublicStorageObjectPath,
  isValidWeekNumber,
  isValidYearMonth,
  MEDIA_BUCKET,
  readAdminWeeklyMediaState,
  ensureWeeklyClassLog,
} from '@/lib/weekly-media'

function mapError(message: string, fallback: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
  }

  if (message.includes('duplicate key value')) {
    return { error: 'MEDIA_DUPLICATED', status: 409 }
  }

  return { error: fallback, status: 500 }
}

async function ensureAdminAccess() {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  return null
}

export async function GET(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const searchParams = request.nextUrl.searchParams
  const classId = searchParams.get('classId')
  const yearMonth = searchParams.get('yearMonth')

  if (!classId) {
    return NextResponse.json({ error: 'CLASS_ID_REQUIRED' }, { status: 400 })
  }

  if (!yearMonth || !isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const data = await readAdminWeeklyMediaState(supabase, classId, yearMonth)

    if (!data) {
      return NextResponse.json({ error: 'CLASS_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-media', 'MEDIA_READ_FAILED', error)
    return NextResponse.json({ error: 'MEDIA_READ_FAILED' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const body = (await request.json().catch(() => null)) as
    | {
        classId?: string
        yearMonth?: string
        weekNumber?: number
        url?: string
      }
    | null

  if (!body?.classId || !body.yearMonth || !body.url || !isValidWeekNumber(body.weekNumber ?? 0)) {
    return NextResponse.json({ error: 'INVALID_MEDIA_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const log = await ensureWeeklyClassLog(supabase, body.classId, body.yearMonth, body.weekNumber!)
    const { data, error } = await supabase
      .from('media')
      .insert({
        log_id: log.id,
        type: 'VIDEO',
        url: body.url.trim(),
        upload_method: 'MANUAL',
      })
      .select('id, type, url, upload_method')
      .single()

    if (error) {
      const mapped = mapError(error.message, 'MEDIA_SAVE_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-media', 'MEDIA_SAVE_FAILED', error)
    return NextResponse.json({ error: 'MEDIA_SAVE_FAILED' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const body = (await request.json().catch(() => null)) as
    | {
        mediaId?: string
        url?: string
      }
    | null

  if (!body?.mediaId || !body.url) {
    return NextResponse.json({ error: 'INVALID_MEDIA_INPUT' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('media')
      .update({
        url: body.url.trim(),
      })
      .eq('id', body.mediaId)
      .eq('type', 'VIDEO')
      .select('id, type, url, upload_method')
      .maybeSingle()

    if (error) {
      const mapped = mapError(error.message, 'MEDIA_SAVE_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    if (!data) {
      return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-media', 'MEDIA_SAVE_FAILED', error)
    return NextResponse.json({ error: 'MEDIA_SAVE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const body = (await request.json().catch(() => null)) as { mediaId?: string } | null

  if (!body?.mediaId) {
    return NextResponse.json({ error: 'MEDIA_ID_REQUIRED' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const { data: mediaRow, error: mediaReadError } = await supabase
      .from('media')
      .select('id, type, url')
      .eq('id', body.mediaId)
      .maybeSingle()

    if (mediaReadError) {
      const mapped = mapError(mediaReadError.message, 'MEDIA_DELETE_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    if (!mediaRow) {
      return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 })
    }

    if (mediaRow.type === 'IMAGE') {
      const objectPath = getPublicStorageObjectPath(mediaRow.url, MEDIA_BUCKET)
      if (objectPath) {
        const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([objectPath])
        if (storageError) {
          logApiWarning('admin.weekly-media', 'MEDIA_STORAGE_CLEANUP_SKIPPED', {
            mediaId: body.mediaId,
            objectPath,
            message: storageError.message,
          })
        }
      }
    }

    const { error: deleteError } = await supabase.from('media').delete().eq('id', body.mediaId)

    if (deleteError) {
      const mapped = mapError(deleteError.message, 'MEDIA_DELETE_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logApiError('admin.weekly-media', 'MEDIA_DELETE_FAILED', error)
    return NextResponse.json({ error: 'MEDIA_DELETE_FAILED' }, { status: 500 })
  }
}
