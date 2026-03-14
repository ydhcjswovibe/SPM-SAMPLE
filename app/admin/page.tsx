'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { ClassSelector } from '@/components/class-selector'
import { AdminMatrix } from '@/components/admin-matrix'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Download, Plus, Loader2, Users, CreditCard, CalendarCheck } from 'lucide-react'
import type { Class, AdminMatrixData, PaymentStatus, AttendanceStatus } from '@/lib/types'

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

async function fetchMatrixData(classId: string): Promise<AdminMatrixData | null> {
  // Get class info
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (classError || !classData) return null

  // Get enrollments with student profiles
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      id,
      payment_status,
      student_id,
      profiles!enrollments_student_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('class_id', classId)

  if (enrollError) throw enrollError

  // Get all attendances for these enrollments
  const enrollmentIds = enrollments?.map(e => e.id) || []
  
  const { data: attendances, error: attError } = await supabase
    .from('attendances')
    .select('*')
    .in('enrollment_id', enrollmentIds)
    .order('week_number', { ascending: true })

  if (attError) throw attError

  // Transform data
  const students = (enrollments || []).map(enrollment => {
    const profile = enrollment.profiles as { id: string; full_name: string | null; email: string } | null
    const studentAttendances = (attendances || [])
      .filter(a => a.enrollment_id === enrollment.id)
      .map(a => ({
        week: a.week_number,
        status: a.status as AttendanceStatus,
        attendanceId: a.id,
      }))

    return {
      enrollmentId: enrollment.id,
      studentId: profile?.id || '',
      studentName: profile?.full_name || '',
      studentEmail: profile?.email || '',
      paymentStatus: enrollment.payment_status as PaymentStatus,
      attendances: studentAttendances,
    }
  })

  return {
    classId: classData.id,
    className: classData.name,
    totalWeeks: classData.total_weeks,
    students,
  }
}

export default function AdminDashboard() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')

  const { data: classes, mutate: mutateClasses } = useSWR('classes', fetchClasses)
  
  const { data: matrixData, mutate: mutateMatrix } = useSWR(
    selectedClass ? `matrix-${selectedClass.id}` : null,
    () => selectedClass ? fetchMatrixData(selectedClass.id) : null
  )

  // Auto-select first class
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0])
    }
  }, [classes, selectedClass])

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return

    setIsCreating(true)
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClassName.trim(),
          description: newClassDescription.trim() || null,
          total_weeks: 4,
        })
        .select()
        .single()

      if (error) throw error

      await mutateClasses()
      setSelectedClass(data)
      setIsCreateDialogOpen(false)
      setNewClassName('')
      setNewClassDescription('')
      toast.success('Class created successfully', {
        description: `"${data.name}" has been created.`,
      })
    } catch (error) {
      console.error('Failed to create class:', error)
      const errorMessage = error instanceof Error ? error.message : 
        (error as { message?: string })?.message || 'An unexpected error occurred'
      toast.error('Failed to create class', {
        description: errorMessage,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handlePaymentChange = async (enrollmentId: string, status: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ payment_status: status })
        .eq('id', enrollmentId)

      if (error) throw error
      await mutateMatrix()
      toast.success('Payment status updated')
    } catch (error) {
      console.error('Failed to update payment:', error)
      toast.error('Failed to update payment status')
    }
  }

  const handleAttendanceChange = async (attendanceId: string, status: AttendanceStatus) => {
    try {
      const { error } = await supabase
        .from('attendances')
        .update({ 
          status, 
          marked_at: status !== 'pending' ? new Date().toISOString() : null 
        })
        .eq('id', attendanceId)

      if (error) throw error
      await mutateMatrix()
      toast.success('Attendance updated')
    } catch (error) {
      console.error('Failed to update attendance:', error)
      toast.error('Failed to update attendance')
    }
  }

  const handleExportCSV = useCallback(() => {
    if (!matrixData) return

    const headers = ['Name', 'Email', 'Payment', ...Array.from({ length: matrixData.totalWeeks }, (_, i) => `Week ${i + 1}`)]
    const rows = matrixData.students.map(student => [
      student.studentName,
      student.studentEmail,
      student.paymentStatus,
      ...student.attendances.map(a => a.status)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${matrixData.className}_attendance_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [matrixData])

  // Stats calculation
  const stats = matrixData ? {
    totalStudents: matrixData.students.length,
    paidStudents: matrixData.students.filter(s => s.paymentStatus === 'paid').length,
    avgAttendance: matrixData.students.length > 0
      ? Math.round(
          (matrixData.students.flatMap(s => s.attendances).filter(a => a.status === 'present').length /
            Math.max(matrixData.students.flatMap(s => s.attendances).length, 1)) * 100
        )
      : 0,
  } : null

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <h1 className="font-semibold text-lg md:hidden">Dashboard</h1>
          <div className="flex items-center gap-2">
            <ClassSelector
              classes={classes || []}
              selectedClass={selectedClass}
              onSelect={setSelectedClass}
              onCreateNew={() => setIsCreateDialogOpen(true)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!matrixData || matrixData.students.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paid</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-success">{stats.paidStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.avgAttendance}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedClass ? `${selectedClass.name} - Attendance` : 'Select a class'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Select a class or create a new one</p>
                <Button 
                  className="mt-4 gap-2" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Class
                </Button>
              </div>
            ) : !matrixData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AdminMatrix
                data={matrixData}
                onPaymentChange={handlePaymentChange}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Create a new class. Classes are organized into 4 weeks.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Q1 2024 Basic Course"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="classDescription">Description (optional)</Label>
              <Textarea
                id="classDescription"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                placeholder="Enter a description for the class"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass} disabled={!newClassName.trim() || isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
