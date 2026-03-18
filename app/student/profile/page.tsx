'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { CheckCircle, Loader2, Monitor, Moon, Save, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'

import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { formatYearMonthLabel, readStudentClassSummaries, type StudentClassSummary } from '@/lib/weekly-media'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudentEnrollmentRequestCard } from '@/components/student-enrollment-request-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const supabase = createClient()
const authRequiredMessage = '로그인이 필요합니다.'

async function readRouteError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  return payload?.error ?? 'REQUEST_FAILED'
}

async function fetchProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

async function fetchStudentStatus(): Promise<StudentClassSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  return readStudentClassSummaries(supabase, user.id)
}

export default function StudentProfilePage() {
  const { theme, setTheme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    data: profile,
    error: profileError,
    isLoading: isProfileLoading,
    mutate,
  } = useSWR('student-profile', fetchProfile)
  const { data: summaries } = useSWR('student-status-summary', fetchStudentStatus)
  const savedName = profile?.full_name ?? ''
  const hasPendingNameChange = fullName.trim() !== savedName

  const activeCount = summaries?.filter((item) => item.enrollmentStatus === 'ACTIVE').length ?? 0
  const pendingCount = summaries?.filter((item) => item.enrollmentStatus === 'PENDING').length ?? 0
  const unpaidCount = summaries?.filter((item) => !item.paymentStatus).length ?? 0
  const feedbackCount = summaries?.reduce((sum, item) => sum + item.feedbackCount, 0) ?? 0
  const nextLesson = summaries?.find((item) => item.nextWeekNumber)
  const nextLessonHref = nextLesson
    ? `/student?classId=${encodeURIComponent(nextLesson.classId)}&yearMonth=${encodeURIComponent(nextLesson.yearMonth)}`
    : '/student'

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setSaveError(null)
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    setSaveError(null)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
        }),
      })

      if (!response.ok) {
        throw new Error(await readRouteError(response))
      }

      await mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message === 'AUTH_REQUIRED'
          ? authRequiredMessage
          : '이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isProfileLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">내 상태</h1>
          <p className="text-sm text-muted-foreground">
            출석, 결제, 피드백 상태를 먼저 확인하고 계정 정보는 아래에서 관리합니다.
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            계정 정보를 불러오는 중입니다.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">내 상태</h1>
          <p className="text-sm text-muted-foreground">
            출석, 결제, 피드백 상태를 먼저 확인하고 계정 정보는 아래에서 관리합니다.
          </p>
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive">계정 정보를 불러올 수 없습니다.</CardTitle>
            <CardDescription className="text-destructive/80">
              {profileError ? '학생 계정 정보를 다시 불러오지 못했습니다.' : authRequiredMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void mutate()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">내 상태</h1>
        <p className="text-sm text-muted-foreground">
          출석, 결제, 피드백 상태를 먼저 확인하고 계정 정보는 아래에서 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">수강 중</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">등록 예정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">결제 미완료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{unpaidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">피드백</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{feedbackCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">수업 바로 가기</CardTitle>
          <CardDescription>확인할 수업으로 바로 돌아갑니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextLesson ? (
            <>
              <div className="rounded-xl bg-muted/60 px-3 py-3 text-sm">
                <p className="font-medium">{nextLesson.className}</p>
                <p className="mt-1 text-muted-foreground">
                  {formatYearMonthLabel(nextLesson.yearMonth)} · {nextLesson.nextWeekNumber}주차
                </p>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link href={nextLessonHref}>이어서 보기</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">지금 바로 열 수 있는 주차가 없어도 수업 탭에서 전체 수업을 확인할 수 있습니다.</p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={nextLessonHref}>수업 탭 열기</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <StudentEnrollmentRequestCard
        title="새 수업 요청"
        description="등록이 안 된 수업도 여기서 먼저 요청할 수 있습니다. 운영이 확인하면 수업 탭에 등록 예정으로 바로 나타납니다."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{profile.full_name || '이름 없음'}</span>
              <span className="text-sm text-muted-foreground">{profile.email}</span>
            </div>
          </div>

          {saveError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
              {saveError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              value={fullName || profile.full_name || ''}
              onChange={(event) => {
                setFullName(event.target.value)
                setSaved(false)
                setSaveError(null)
              }}
              placeholder="이름을 입력해 주세요"
            />
          </div>

          <div className="space-y-2">
            <Label>이메일</Label>
            <Input value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">이메일 주소는 여기서 바꿀 수 없습니다.</p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !profile || !hasPendingNameChange}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? '저장됨' : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">테마</CardTitle>
          <CardDescription>선호하는 화면 모드를 선택합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              라이트
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              다크
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              시스템
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
