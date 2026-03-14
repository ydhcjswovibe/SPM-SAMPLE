'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, BookOpen, ChevronRight } from 'lucide-react'
import type { Class, Enrollment, Attendance } from '@/lib/types'

const supabase = createClient()

interface EnrollmentWithDetails extends Enrollment {
  classes: Class
  attendances: Attendance[]
}

async function fetchEnrollments(): Promise<EnrollmentWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      classes (*),
      attendances (*)
    `)
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  if (error) throw error
  return (data || []) as EnrollmentWithDetails[]
}

// Demo data for when not logged in
const demoEnrollments: EnrollmentWithDetails[] = [
  {
    id: 'demo-1',
    class_id: 'demo-class-1',
    student_id: 'demo-student',
    payment_status: 'paid',
    enrolled_at: new Date().toISOString(),
    classes: {
      id: 'demo-class-1',
      name: 'Q1 2024 Basic Course',
      description: 'Introduction to the basics',
      total_weeks: 4,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    attendances: [
      { id: '1', enrollment_id: 'demo-1', week_number: 1, status: 'present', marked_at: null },
      { id: '2', enrollment_id: 'demo-1', week_number: 2, status: 'present', marked_at: null },
      { id: '3', enrollment_id: 'demo-1', week_number: 3, status: 'pending', marked_at: null },
      { id: '4', enrollment_id: 'demo-1', week_number: 4, status: 'pending', marked_at: null },
    ],
  },
]

export default function StudentDashboard() {
  const { data: enrollments, isLoading } = useSWR('student-enrollments', fetchEnrollments)
  
  // Use demo data if no enrollments (demo mode)
  const displayEnrollments = enrollments?.length ? enrollments : demoEnrollments

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!displayEnrollments || displayEnrollments.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-medium text-lg">No classes enrolled</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your admin to enroll in a class
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">My Classes</h1>
      
      <div className="space-y-3">
        {displayEnrollments.map((enrollment) => {
          const presentCount = enrollment.attendances.filter(a => a.status === 'present').length
          const totalWeeks = enrollment.classes.total_weeks
          const progressPercent = (presentCount / totalWeeks) * 100

          return (
            <Link 
              key={enrollment.id} 
              href={`/student/class/${enrollment.class_id}`}
            >
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{enrollment.classes.name}</h3>
                        {enrollment.payment_status === 'paid' ? (
                          <Badge variant="default" className="shrink-0 text-xs">Paid</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-xs">Unpaid</Badge>
                        )}
                      </div>
                      {enrollment.classes.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {enrollment.classes.description}
                        </p>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Attendance</span>
                          <span>{presentCount}/{totalWeeks} weeks</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
