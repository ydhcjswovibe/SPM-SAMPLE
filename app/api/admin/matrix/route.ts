import { type NextRequest, NextResponse } from 'next/server'

import { isAdminRole } from '@/lib/auth/roles'
import { readServerAccessContext } from '@/lib/auth/server'
import { getCurrentYearMonth, isValidYearMonth, readAdminMatrixData } from '@/lib/admin/matrix'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const access = await readServerAccessContext()

  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
  }

  if (!isAdminRole(access.role)) {
    return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const classId = searchParams.get('classId')
  const yearMonth = searchParams.get('yearMonth') ?? getCurrentYearMonth()

  if (!classId) {
    return NextResponse.json({ error: 'CLASS_ID_REQUIRED' }, { status: 400 })
  }

  if (!isValidYearMonth(yearMonth)) {
    return NextResponse.json({ error: 'INVALID_YEAR_MONTH' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const data = await readAdminMatrixData(supabase, classId, yearMonth)

    if (!data) {
      return NextResponse.json({ error: 'MATRIX_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Matrix read failed:', error)
    return NextResponse.json({ error: 'MATRIX_READ_FAILED' }, { status: 500 })
  }
}
