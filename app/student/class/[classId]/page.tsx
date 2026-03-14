'use client'

import { use } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  ArrowLeft, 
  Play, 
  Check, 
  X, 
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import type { Class, WeeklyContent, Attendance, AttendanceStatus } from '@/lib/types'

const supabase = createClient()

interface ClassDetails {
  classInfo: Class
  contents: WeeklyContent[]
  attendances: Attendance[]
}

async function fetchClassDetails(classId: string): Promise<ClassDetails | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Demo mode - return mock data if no user
  if (!user) {
    return {
      classInfo: {
        id: classId,
        name: 'Q1 2024 Basic Course',
        description: 'Introduction to the basics',
        total_weeks: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      contents: [
        { id: '1', class_id: classId, week_number: 1, title: 'Week 1: Introduction', youtube_url: null, image_url: null, description: 'Getting started with the basics', created_at: '', updated_at: '' },
        { id: '2', class_id: classId, week_number: 2, title: 'Week 2: Core Concepts', youtube_url: null, image_url: null, description: 'Understanding core concepts', created_at: '', updated_at: '' },
        { id: '3', class_id: classId, week_number: 3, title: 'Week 3: Practice', youtube_url: null, image_url: null, description: 'Hands-on practice', created_at: '', updated_at: '' },
        { id: '4', class_id: classId, week_number: 4, title: 'Week 4: Review', youtube_url: null, image_url: null, description: 'Final review and wrap-up', created_at: '', updated_at: '' },
      ],
      attendances: [
        { id: '1', enrollment_id: 'demo', week_number: 1, status: 'present', marked_at: null },
        { id: '2', enrollment_id: 'demo', week_number: 2, status: 'present', marked_at: null },
        { id: '3', enrollment_id: 'demo', week_number: 3, status: 'pending', marked_at: null },
        { id: '4', enrollment_id: 'demo', week_number: 4, status: 'pending', marked_at: null },
      ],
    }
  }

  // Get class info
  const { data: classInfo, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (classError || !classInfo) return null

  // Get weekly contents
  const { data: contents } = await supabase
    .from('weekly_contents')
    .select('*')
    .eq('class_id', classId)
    .order('week_number', { ascending: true })

  // Get student's enrollment and attendances
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', user.id)
    .single()

  let attendances: Attendance[] = []
  if (enrollment) {
    const { data } = await supabase
      .from('attendances')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('week_number', { ascending: true })
    attendances = data || []
  }

  return {
    classInfo,
    contents: contents || [],
    attendances,
  }
}

const attendanceStatusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
  present: { label: 'Present', icon: <Check className="h-4 w-4" />, color: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', icon: <X className="h-4 w-4" />, color: 'bg-destructive text-destructive-foreground' },
  excused: { label: 'Excused', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-info text-info-foreground' },
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function ClassDetailPage({ 
  params 
}: { 
  params: Promise<{ classId: string }> 
}) {
  const { classId } = use(params)
  
  const { data: details, isLoading } = useSWR(
    `class-detail-${classId}`,
    () => fetchClassDetails(classId)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
          <h2 className="font-medium">Class not found</h2>
          <Link href="/student">
            <Button variant="link">Go back</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { classInfo, contents, attendances } = details

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/student">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{classInfo.name}</h1>
            {classInfo.description && (
              <p className="text-xs text-muted-foreground truncate">
                {classInfo.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {Array.from({ length: classInfo.total_weeks }, (_, i) => {
          const weekNumber = i + 1
          const content = contents.find(c => c.week_number === weekNumber)
          const attendance = attendances.find(a => a.week_number === weekNumber)
          const status = attendance?.status || 'pending'
          const statusConfig = attendanceStatusConfig[status]
          const youtubeId = content?.youtube_url ? extractYoutubeId(content.youtube_url) : null

          return (
            <Card key={weekNumber}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {weekNumber}
                    </span>
                    {content?.title || `Week ${weekNumber}`}
                  </CardTitle>
                  <Badge className={statusConfig.color}>
                    <span className="flex items-center gap-1">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* YouTube Video */}
                {youtubeId && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={`Week ${weekNumber} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Image */}
                {content?.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={content.image_url}
                      alt={`Week ${weekNumber} image`}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Description */}
                {content?.description && (
                  <p className="text-sm text-muted-foreground">
                    {content.description}
                  </p>
                )}

                {/* Empty State */}
                {!youtubeId && !content?.image_url && !content?.description && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-2">
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No content available yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
