'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { CheckCircle, Loader2, Monitor, Moon, Save, Sparkles, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'

import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { readStudentClassSummaries, type StudentClassSummary } from '@/lib/weekly-media'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SpmMascot } from '@/components/spm-mascot'
import { cn } from '@/lib/utils'

const supabase = createClient()
const authRequiredMessage = '로그인이 필요합니다.'
const STUDENT_PROFILE_REFRESH_INTERVAL_MS = 5000

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
  const { data: summaries } = useSWR('student-status-summary', fetchStudentStatus, {
    refreshInterval: STUDENT_PROFILE_REFRESH_INTERVAL_MS,
  })
  const savedName = profile?.full_name ?? ''
  const hasPendingNameChange = fullName.trim() !== savedName

  const activeCount = summaries?.filter((item) => item.enrollmentStatus === 'ACTIVE').length ?? 0
  const pendingCount = summaries?.filter((item) => item.enrollmentStatus === 'PENDING').length ?? 0
  const unpaidCount = summaries?.filter((item) => !item.paymentStatus).length ?? 0
  const feedbackCount = summaries?.reduce((sum, item) => sum + item.feedbackCount, 0) ?? 0
  const summaryCards = [
    { label: '수강 중', value: activeCount, tone: 'bg-[#fff4c5] text-[#9d7523]' },
    { label: '등록 예정', value: pendingCount, tone: 'bg-[#eef8de] text-[#5f8d39]' },
    { label: '결제 미완료', value: unpaidCount, tone: 'bg-[#ffe9e4] text-[#bc6d61]' },
    { label: '피드백', value: feedbackCount, tone: 'bg-[#edf5ff] text-[#5c7bc8]' },
  ]

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
      <div className="space-y-3 px-3 pb-28 pt-3">
        <Card className="gap-0 rounded-[2rem] border border-[#e5e7d0] bg-white/92 py-0 shadow-[0_14px_28px_rgba(111,145,72,0.08)]">
          <CardContent className="flex items-center gap-3 px-4 py-4 text-sm text-[#6d7d5e]">
            <Loader2 className="h-4 w-4 animate-spin" />
            내상태 카드를 불러오는 중입니다.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="space-y-3 px-3 pb-28 pt-3">
        <Card className="gap-0 rounded-[2rem] border border-destructive/30 bg-[#fff5f0] py-0 shadow-[0_14px_28px_rgba(184,86,70,0.08)]">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-base text-destructive">계정 정보를 불러올 수 없습니다.</CardTitle>
            <CardDescription className="text-destructive/80">
              {profileError ? '학생 계정 정보를 다시 불러오지 못했습니다.' : authRequiredMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 px-4 pb-4 pt-0">
            <Button variant="outline" onClick={() => void mutate()} className="rounded-full bg-white">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-3 pb-28 pt-3">
      <section className="relative overflow-hidden rounded-[2.45rem] border border-[#e4e8d8] bg-[linear-gradient(180deg,rgba(243,248,255,0.96)_0%,rgba(255,254,248,0.98)_46%,rgba(244,248,235,0.98)_100%)] px-4 pb-5 pt-4 shadow-[0_16px_28px_rgba(111,145,72,0.1)]">
        <div className="absolute inset-x-0 bottom-0 h-[4.5rem] bg-[rgba(185,216,132,0.3)]" />
        <div className="absolute -left-4 bottom-4 h-14 w-20 rounded-full bg-[rgba(165,205,111,0.24)]" />
        <div className="absolute left-10 top-8 h-10 w-10 rounded-full bg-white/64" />
        <div className="absolute right-6 top-6 h-14 w-14 rounded-full bg-[rgba(255,242,193,0.48)]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7e57]">내상태 카드</p>
              <h1 className="mt-1 text-[1.9rem] font-black tracking-[-0.04em] text-[#314127]">
                차곡차곡 모은 기록
              </h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-[#ebf0e2] bg-white/92 shadow-[0_6px_12px_rgba(111,145,72,0.06)]">
              <SpmMascot size="sm" className="h-9 w-9" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ebf0e2] bg-white/94 p-4 shadow-[0_10px_20px_rgba(111,145,72,0.06)]">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border-4 border-[#f7f4e7] shadow-[0_8px_14px_rgba(111,145,72,0.1)]">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-[#eef8de] text-[#689247]">
                  <User className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-xl font-black tracking-[-0.03em] text-[#314127]">
                  {profile.full_name || '이름 없음'}
                </p>
                <p className="mt-1 truncate text-sm text-[#708060]">{profile.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff5ca] px-3 py-1.5 text-[11px] font-semibold text-[#9a7427]">
                  <Sparkles className="h-3.5 w-3.5" />
                  오늘도 한 칸씩 기록을 모아봐요
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e7eddb] bg-[#fffefb] p-3 shadow-[0_12px_22px_rgba(111,145,72,0.07)]">
        <div className="grid grid-cols-2 gap-2.5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[1.6rem] border border-[#eef2e5] bg-white px-4 py-4 shadow-[0_8px_14px_rgba(111,145,72,0.05)]"
            >
              <div className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', card.tone)}>
                {card.label}
              </div>
              <p className="mt-3 text-[1.55rem] font-black tracking-[-0.03em] text-[#314127]">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Card className="gap-0 rounded-[2rem] border border-[#e3e9d8] bg-white py-0 shadow-[0_12px_22px_rgba(111,145,72,0.06)]">
        <CardHeader className="px-5 pb-2 pt-4">
          <CardTitle className="text-[1.2rem] font-black tracking-[-0.03em] text-[#314127]">계정 정보</CardTitle>
          <CardDescription className="text-[#6f7d60]">이름은 여기서 바로 바꿀 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 pt-0">
          {saveError ? (
            <div className="rounded-[1.3rem] border border-destructive/30 bg-[#fff5f0] px-4 py-3 text-sm text-destructive">
              {saveError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[#314127]">이름</Label>
            <Input
              id="fullName"
              value={fullName || profile.full_name || ''}
              onChange={(event) => {
                setFullName(event.target.value)
                setSaved(false)
                setSaveError(null)
              }}
              placeholder="이름을 입력해 주세요"
              className="h-12 rounded-[1.35rem] border-[#dce8cc] bg-[#fbfdf6] shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#314127]">이메일</Label>
            <Input value={profile.email} disabled className="h-12 rounded-[1.35rem] border-[#ebe9e0] bg-[#f8f6ef] text-[#7f8678]" />
            <p className="text-xs text-[#6f7d60]">이메일 주소는 여기서 바꿀 수 없습니다.</p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !profile || !hasPendingNameChange}
              className="h-11 gap-2 rounded-[1.35rem] border-[#75b84f] bg-[#8fcf62] px-4 font-bold text-white shadow-[0_10px_18px_rgba(111,174,71,0.22)] hover:bg-[#9ad670]"
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

      <Card className="gap-0 rounded-[2rem] border border-[#dfe8f4] bg-[#f8fbff] py-0 shadow-[0_12px_22px_rgba(116,148,195,0.06)]">
        <CardHeader className="px-5 pb-2 pt-4">
          <CardTitle className="text-[1.2rem] font-black tracking-[-0.03em] text-[#37506b]">화면 모드</CardTitle>
          <CardDescription className="text-[#6f8196]">샘플처럼 부드러운 화면 톤을 고를 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('light')}
              className={cn(
                'h-12 gap-2 rounded-[1.25rem] border-[#d7e4f8] bg-white font-semibold text-[#647792]',
                theme === 'light' ? 'border-[#ffd98e] bg-[#fff4ca] text-[#9a7426]' : null,
              )}
            >
              <Sun className="h-4 w-4" />
              라이트
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('dark')}
              className={cn(
                'h-12 gap-2 rounded-[1.25rem] border-[#d7e4f8] bg-white font-semibold text-[#647792]',
                theme === 'dark' ? 'border-[#c8d3ef] bg-[#edf2ff] text-[#5a6dc0]' : null,
              )}
            >
              <Moon className="h-4 w-4" />
              다크
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('system')}
              className={cn(
                'h-12 gap-2 rounded-[1.25rem] border-[#d7e4f8] bg-white font-semibold text-[#647792]',
                theme === 'system' ? 'border-[#cfe7c9] bg-[#f0f9e8] text-[#5d8840]' : null,
              )}
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
