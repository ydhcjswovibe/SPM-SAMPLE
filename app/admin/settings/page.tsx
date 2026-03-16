'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, CheckCircle, Loader2, Monitor, Moon, Save, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'

import { createClient } from '@/lib/supabase/client'
import { getRoleLabel } from '@/lib/auth/roles'
import type { Profile } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) {
    throw new Error(authRequiredMessage)
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === authRequiredMessage) {
    return authRequiredMessage
  }

  return '계정 정보를 불러오지 못했습니다.'
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    data: profile,
    error,
    isLoading,
    mutate,
  } = useSWR('admin-settings-profile', fetchProfile)

  const savedName = profile?.full_name ?? ''
  const hasPendingNameChange = fullName.trim() !== savedName

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setSaveError(null)
      return
    }

    setFullName('')
  }, [profile])

  async function handleSave() {
    if (!profile) return

    setIsSaving(true)
    setSaved(false)
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
      window.setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message === 'AUTH_REQUIRED'
          ? '로그인이 필요합니다.'
          : '이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <h1 className="font-semibold text-lg">설정</h1>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <div className="space-y-3">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">계정 정보를 불러오는 중입니다.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    const errorMessage = error ? getProfileErrorMessage(error) : '계정 정보를 찾을 수 없습니다.'
    const needsLogin = error instanceof Error && error.message === authRequiredMessage

    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <h1 className="font-semibold text-lg">설정</h1>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">
          <Card className="mx-auto max-w-lg border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive">설정을 열 수 없습니다.</CardTitle>
              <CardDescription className="text-destructive/80">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {needsLogin ? (
                <Button asChild>
                  <Link href="/auth/login">다시 로그인하기</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => void mutate()}>
                  다시 시도
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <h1 className="font-semibold text-lg">설정</h1>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">내 계정</CardTitle>
            <CardDescription>이름과 현재 로그인한 계정 정보를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{profile.full_name || '이름 없음'}</span>
                <span className="text-sm text-muted-foreground">{profile.email}</span>
                <span className="mt-1 text-xs text-primary">{getRoleLabel(profile.role)}</span>
              </div>
            </div>

            {saveError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive">
                {saveError}
              </div>
            ) : null}

            {saved ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-950">
                <CheckCircle className="h-4 w-4" />
                이름을 저장했습니다.
              </div>
            ) : null}

            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
              현재 이 화면에서는 이름 확인 및 수정과 화면 테마 선택만 지원합니다.
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value)
                  setSaved(false)
                  setSaveError(null)
                }}
                placeholder="이름을 입력해 주세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">이메일은 이 화면에서 변경하지 않습니다.</p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => void handleSave()}
                disabled={isSaving || !hasPendingNameChange}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? '저장 중' : saved ? '저장됨' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">화면 테마</CardTitle>
            <CardDescription>현재 기기에서 볼 테마를 선택합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
    </div>
  )
}
