import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'LEGACY_UPLOAD_ROUTE_DISABLED',
      detail: '주차 이미지 업로드는 /api/admin/weekly-media/image 경로만 사용합니다.',
    },
    { status: 410 },
  )
}
