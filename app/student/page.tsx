'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, BookOpen, ChevronRight, AlertCircle } from 'lucide-react'
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

export default function StudentDashboard() {
  const { data: enrollments, isLoading } = useSWR('student-enrollments', fetchEnrollments)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-medium text-lg">등록된 수업이 없습니다</h2>
          <p className="text-sm text-muted-foreground mt-1">
            관리자에게 문의하여 수업에 등록해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">내 수업</h1>
      
      <div className="space-y-3">
        {enrollments.map((enrollment) => {
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
                          <Badge variant="default" className="shrink-0 text-xs">결제완료</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-xs">미결제</Badge>
                        )}
                      </div>
                      {enrollment.classes.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {enrollment.classes.description}
                        </p>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>출석 현황</span>
                          <span>{presentCount}/{totalWeeks}주</span>
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
