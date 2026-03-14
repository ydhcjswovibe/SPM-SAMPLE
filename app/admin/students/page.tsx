'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { ClassSelector } from '@/components/class-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Loader2, 
  UserPlus, 
  UserMinus, 
  Search,
  Mail,
  AlertCircle 
} from 'lucide-react'
import type { Class, Profile, Enrollment } from '@/lib/types'

const supabase = createClient()

async function fetchClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

interface EnrollmentWithProfile extends Enrollment {
  profiles: Profile
}

async function fetchEnrollments(classId: string): Promise<EnrollmentWithProfile[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      profiles!enrollments_student_id_fkey (*)
    `)
    .eq('class_id', classId)
    .order('enrolled_at', { ascending: false })

  if (error) throw error
  return (data || []) as EnrollmentWithProfile[]
}

async function fetchAvailableStudents(classId: string): Promise<Profile[]> {
  // Get all students not enrolled in this class
  const { data: enrolledIds } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)

  const enrolledStudentIds = enrolledIds?.map(e => e.student_id) || []

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  if (enrolledStudentIds.length > 0) {
    query = query.not('id', 'in', `(${enrolledStudentIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export default function StudentsPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const { data: classes } = useSWR('classes', fetchClasses)
  
  const { data: enrollments, mutate: mutateEnrollments } = useSWR(
    selectedClass ? `enrollments-${selectedClass.id}` : null,
    () => selectedClass ? fetchEnrollments(selectedClass.id) : null
  )

  const { data: availableStudents, mutate: mutateAvailable } = useSWR(
    selectedClass && isAddDialogOpen ? `available-${selectedClass.id}` : null,
    () => selectedClass ? fetchAvailableStudents(selectedClass.id) : null
  )

  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0])
    }
  }, [classes, selectedClass])

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedClass) return

    setIsEnrolling(studentId)
    try {
      // Create enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          class_id: selectedClass.id,
          student_id: studentId,
          payment_status: 'unpaid',
        })
        .select()
        .single()

      if (enrollError) throw enrollError

      // Create attendance records for all weeks
      const attendanceRecords = Array.from({ length: selectedClass.total_weeks }, (_, i) => ({
        enrollment_id: enrollment.id,
        week_number: i + 1,
        status: 'pending',
      }))

      const { error: attError } = await supabase
        .from('attendances')
        .insert(attendanceRecords)

      if (attError) throw attError

      await mutateEnrollments()
      await mutateAvailable()
    } catch (error) {
      console.error('Failed to enroll student:', error)
    } finally {
      setIsEnrolling(null)
    }
  }

  const handleRemoveStudent = async (enrollmentId: string) => {
    setIsRemoving(enrollmentId)
    try {
      // Delete attendance records first (cascade should handle this, but just in case)
      await supabase
        .from('attendances')
        .delete()
        .eq('enrollment_id', enrollmentId)

      // Delete enrollment
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) throw error

      await mutateEnrollments()
    } catch (error) {
      console.error('Failed to remove student:', error)
    } finally {
      setIsRemoving(null)
    }
  }

  const filteredAvailableStudents = availableStudents?.filter(student => 
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <h1 className="font-semibold text-lg md:hidden">학생 관리</h1>
          <div className="flex items-center gap-2">
            <ClassSelector
              classes={classes || []}
              selectedClass={selectedClass}
              onSelect={setSelectedClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={!selectedClass}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">학생 배정</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedClass ? `${selectedClass.name} 수강생` : '클래스를 선택하세요'}
            </CardTitle>
            {selectedClass && (
              <CardDescription>
                총 {enrollments?.length || 0}명의 학생이 등록되어 있습니다
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">클래스를 선택해주세요</p>
              </div>
            ) : !enrollments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium">등록된 학생이 없습니다</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  학생 배정 버튼을 눌러 학생을 추가하세요
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  학생 배정하기
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {enrollment.profiles.full_name || '이름 없음'}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {enrollment.profiles.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={enrollment.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {enrollment.payment_status === 'paid' ? '결제완료' : 
                         enrollment.payment_status === 'refunded' ? '환불' : '미결제'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveStudent(enrollment.id)}
                        disabled={isRemoving === enrollment.id}
                      >
                        {isRemoving === enrollment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[80dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>학생 배정</DialogTitle>
            <DialogDescription>
              {selectedClass?.name}에 학생을 배정합니다
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름 또는 이메일로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-[200px]">
            {!availableStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAvailableStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? '검색 결과가 없습니다' : '배정 가능한 학생이 없습니다'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAvailableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {student.full_name || '이름 없음'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {student.email}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnrollStudent(student.id)}
                      disabled={isEnrolling === student.id}
                      className="gap-2"
                    >
                      {isEnrolling === student.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      배정
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
