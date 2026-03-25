import { NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { logApiError, logApiWarning } from '@/lib/server/logger'
import { createClient } from '@/lib/supabase/server'
import {
  buildWeeklyImageObjectPath,
  ensureWeeklyClassLog,
  getPublicStorageObjectPath,
  isValidWeekNumber,
  isValidYearMonth,
  MEDIA_BUCKET,
} from '@/lib/weekly-media'

function mapError(message: string, fallback: string) {
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return { error: 'ADMIN_REQUIRED', status: 403 }
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

export async function POST(request: Request) {
  const denied = await ensureAdminAccess()
  if (denied) return denied

  const formData = await request.formData()
  const file = formData.get('file')
  const classId = String(formData.get('classId') ?? '')
  const yearMonth = String(formData.get('yearMonth') ?? '')
  const weekNumber = Number(formData.get('weekNumber') ?? 0)
  const mediaId = String(formData.get('mediaId') ?? '').trim() || null

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'IMAGE_REQUIRED' }, { status: 400 })
  }

  if (!classId || !isValidYearMonth(yearMonth) || !isValidWeekNumber(weekNumber)) {
    return NextResponse.json({ error: 'INVALID_MEDIA_INPUT' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'INVALID_IMAGE_TYPE' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'IMAGE_TOO_LARGE' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const log = await ensureWeeklyClassLog(supabase, classId, yearMonth, weekNumber)
    const objectPath = buildWeeklyImageObjectPath({
      classId,
      yearMonth,
      weekNumber,
      fileName: file.name,
    })

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      const mapped = mapError(uploadError.message, 'IMAGE_UPLOAD_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath)

    if (mediaId) {
      const { data: existingRow, error: existingError } = await supabase
        .from('media')
        .select('id, url')
        .eq('id', mediaId)
        .eq('type', 'IMAGE')
        .maybeSingle()

      if (existingError) {
        const mapped = mapError(existingError.message, 'IMAGE_UPLOAD_FAILED')
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      if (!existingRow) {
        return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 })
      }

      const { data, error } = await supabase
        .from('media')
        .update({
          url: publicUrl,
          upload_method: 'MANUAL',
        })
        .eq('id', mediaId)
        .select('id, type, url, upload_method')
        .maybeSingle()

      if (error) {
        const mapped = mapError(error.message, 'IMAGE_UPLOAD_FAILED')
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      const previousObjectPath = getPublicStorageObjectPath(existingRow.url, MEDIA_BUCKET)
      if (previousObjectPath) {
        const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([previousObjectPath])
        if (removeError) {
          logApiWarning('admin.weekly-media.image', 'IMAGE_REPLACE_CLEANUP_SKIPPED', {
            mediaId,
            objectPath: previousObjectPath,
            message: removeError.message,
          })
        }
      }

      return NextResponse.json({ data })
    }

    const { data, error } = await supabase
      .from('media')
      .insert({
        log_id: log.id,
        type: 'IMAGE',
        url: publicUrl,
        upload_method: 'MANUAL',
      })
      .select('id, type, url, upload_method')
      .single()

    if (error) {
      const mapped = mapError(error.message, 'IMAGE_UPLOAD_FAILED')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logApiError('admin.weekly-media.image', 'IMAGE_UPLOAD_FAILED', error)
    return NextResponse.json({ error: 'IMAGE_UPLOAD_FAILED' }, { status: 500 })
  }
}
