'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Lock, MessageSquareText, Save, StickyNote } from 'lucide-react'

import type { WeeklyNotesStudent, WeeklyNotesWeek } from '@/lib/admin/weekly-notes'
import {
  adminAlertCardClass,
  adminEditorSurfaceClass,
  adminPrimaryButtonClass,
  adminSubtlePanelClass,
  adminSurfaceTextareaClass,
} from '@/lib/admin/surface'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface WeekNotesEditorProps {
  week: WeeklyNotesWeek
  students: WeeklyNotesStudent[]
  focusStudentId?: string | null
  onSave: (payload: {
    progressText: string
    sharedFeedbackText: string
    adminNoteText: string
    memberFeedbackByStudentId: Record<string, string>
  }) => Promise<void>
}

export function WeekNotesEditor({
  week,
  students,
  focusStudentId,
  onSave,
}: WeekNotesEditorProps) {
  const [progressText, setProgressText] = useState(week.progressText ?? '')
  const [sharedFeedbackText, setSharedFeedbackText] = useState(week.sharedFeedbackText ?? '')
  const [adminNoteText, setAdminNoteText] = useState(week.adminNoteText ?? '')
  const [memberFeedbackByStudentId, setMemberFeedbackByStudentId] = useState<Record<string, string>>(
    week.memberFeedbackByStudentId,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const studentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    setProgressText(week.progressText ?? '')
    setSharedFeedbackText(week.sharedFeedbackText ?? '')
    setAdminNoteText(week.adminNoteText ?? '')
    setMemberFeedbackByStudentId(week.memberFeedbackByStudentId)
    setIsSaving(false)
    setActionError(null)
    setSavedMessage(null)
  }, [week])

  useEffect(() => {
    if (!focusStudentId) {
      return
    }

    const target = studentRefs.current[focusStudentId]
    if (!target) {
      return
    }

    target.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [focusStudentId, week.weekNumber])

  async function handleSave() {
    setIsSaving(true)
    setActionError(null)
    setSavedMessage(null)

    try {
      await onSave({
        progressText,
        sharedFeedbackText,
        adminNoteText,
        memberFeedbackByStudentId,
      })
      setSavedMessage('이번 주 메모를 저장했습니다.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '주차 메모 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  function updateStudentFeedback(studentId: string, nextValue: string) {
    setMemberFeedbackByStudentId((current) => ({
      ...current,
      [studentId]: nextValue,
    }))
    setSavedMessage(null)
  }

  return (
    <section className={adminEditorSurfaceClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <StickyNote className="h-4 w-4 text-[#5f8d39]" />
            <span>주차 메모</span>
          </div>
          <p className="text-sm text-muted-foreground">
            학생 공개 메모와 운영 내부메모, 학생별 개별 피드백을 함께 정리합니다.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={handleSave} disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </div>

      {actionError ? (
        <Card className={adminAlertCardClass('danger')}>
          <CardContent className="flex items-start gap-2 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </CardContent>
        </Card>
      ) : null}

      {savedMessage ? (
        <Card className={adminAlertCardClass('success')}>
          <CardContent className="py-3 text-sm font-medium text-[#4f7630]">{savedMessage}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        <div className={adminSubtlePanelClass}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#314127]">
            <MessageSquareText className="h-4 w-4 text-[#eb8d60]" />
            <span>학생에게 보이는 메모</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`week-${week.weekNumber}-progress`}>진행 메모</Label>
            <Textarea
              id={`week-${week.weekNumber}-progress`}
              value={progressText}
              onChange={(event) => {
                setProgressText(event.target.value)
                setSavedMessage(null)
              }}
              placeholder="이번 주에 익힌 내용이나 다음 주 준비 포인트를 적어 주세요."
              className={`min-h-24 ${adminSurfaceTextareaClass}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`week-${week.weekNumber}-shared-feedback`}>공통 피드백</Label>
            <Textarea
              id={`week-${week.weekNumber}-shared-feedback`}
              value={sharedFeedbackText}
              onChange={(event) => {
                setSharedFeedbackText(event.target.value)
                setSavedMessage(null)
              }}
              placeholder="이 주차를 보는 학생 모두에게 공통으로 보여 줄 피드백을 적어 주세요."
              className={`min-h-24 ${adminSurfaceTextareaClass}`}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-[#eadfcb] bg-[#fffcf6] p-3 shadow-[0_10px_18px_rgba(184,149,84,0.05)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#6f5a32]">
            <Lock className="h-4 w-4 text-[#b8893f]" />
            <span>운영 내부메모</span>
          </div>
          <p className="text-xs leading-5 text-[#7d6d4d]">이 메모는 학생 화면에 노출되지 않습니다.</p>
          <div className="space-y-2">
            <Label htmlFor={`week-${week.weekNumber}-admin-note`}>내부 기록</Label>
            <Textarea
              id={`week-${week.weekNumber}-admin-note`}
              value={adminNoteText}
              onChange={(event) => {
                setAdminNoteText(event.target.value)
                setSavedMessage(null)
              }}
              placeholder="운영 확인 메모, 다음 follow-up, 주의사항을 기록해 두세요."
              className="min-h-[11rem] rounded-[1.2rem] border-[#ecdcb9] bg-white/96 text-[#314127] shadow-[0_8px_14px_rgba(184,149,84,0.08)] placeholder:text-[#9a8b69]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-[#e5ecd8] bg-white/96 p-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#314127]">학생별 개별 피드백</p>
          <p className="text-xs leading-5 text-[#6d7d5e]">
            각 학생 본인에게만 보이는 개인 메모입니다. `학생 관리`에서 들어오면 해당 학생 입력칸이 강조됩니다.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[#d9e3c9] bg-[#fbfcf6] px-4 py-6 text-sm text-[#6b7d5e]">
            현재 월에 연결된 학생이 없어 개별 피드백 입력칸은 열리지 않습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => {
              const isFocused = focusStudentId === student.id

              return (
                <div
                  key={student.id}
                  ref={(node) => {
                    studentRefs.current[student.id] = node
                  }}
                  className={cn(
                    'rounded-[1.35rem] border px-3 py-3 transition-colors',
                    isFocused
                      ? 'border-[#f0d77b] bg-[#fff7da] shadow-[0_10px_20px_rgba(207,170,84,0.12)]'
                      : 'border-[#e6ecd9] bg-[#fbfcf7]',
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#314127]">{student.fullName}</p>
                      <p className="text-xs text-[#708060]">
                        {student.email ?? '이메일 미등록'} · {student.enrollmentStatus === 'PENDING' ? '등록 예정' : '수강 중'}
                      </p>
                    </div>
                    {isFocused ? (
                      <span className="inline-flex rounded-full bg-[#ffe8a6] px-2.5 py-1 text-[11px] font-semibold text-[#8c6721]">
                        바로가기 대상
                      </span>
                    ) : null}
                  </div>
                  <Textarea
                    value={memberFeedbackByStudentId[student.id] ?? ''}
                    onChange={(event) => updateStudentFeedback(student.id, event.target.value)}
                    placeholder={`${student.fullName} 학생에게만 보일 피드백을 적어 주세요.`}
                    className="min-h-20 rounded-[1.1rem] border-[#dce8cc] bg-white/96"
                  />
                  <div className="mt-2 rounded-[1.05rem] border border-[#e5ead9] bg-white/90 px-3 py-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d8a6e]">
                      학생 답글
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#58664d]">
                      {week.studentReplyByStudentId[student.id] ?? '아직 남긴 답글이 없습니다.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
