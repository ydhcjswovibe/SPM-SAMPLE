'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react'

const LOCAL_QA_PRESETS = [
  { preset: 'OWNER', label: '오너', description: 'owner 권한 확인' },
  { preset: 'ADMIN', label: '운영', description: 'admin 운영 화면 확인' },
  { preset: 'STUDENT', label: '학생', description: 'student 화면 확인' },
] as const

export function AuthLoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [quickLoginPreset, setQuickLoginPreset] = useState<string | null>(null)
  const [isLocalRuntime] = useState(
    () => typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'),
  )
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isBusy = isLoading || isGoogleLoading || quickLoginPreset !== null

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  const handleQuickLogin = async (preset: 'OWNER' | 'ADMIN' | 'STUDENT') => {
    setQuickLoginPreset(preset)
    setError(null)

    try {
      const response = await fetch('/api/dev/runtime-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preset }),
      })

      const payload = (await response.json().catch(() => null)) as
        | {
            data?: {
              redirectTo?: string
            }
            error?: string
          }
        | null

      if (!response.ok || !payload?.data?.redirectTo) {
        setError(payload?.error ?? 'LOCAL_RUNTIME_LOGIN_FAILED')
        setQuickLoginPreset(null)
        return
      }

      router.replace(payload.data.redirectTo)
      router.refresh()
    } catch {
      setError('LOCAL_RUNTIME_LOGIN_FAILED')
      setQuickLoginPreset(null)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            S
          </div>
          <CardTitle className="text-2xl">SPM</CardTitle>
          <CardDescription>교육 운영 관리 시스템에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              onClick={handlePasswordLogin}
              disabled={isBusy}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              이메일로 로그인
            </Button>
          </div>

          {isLocalRuntime && (
            <div className="rounded-xl border border-dashed bg-muted/40 p-3">
              <div className="mb-3 space-y-1 text-center">
                <p className="text-sm font-medium">로컬 QA 원클릭 로그인</p>
                <p className="text-xs text-muted-foreground">
                  localhost 전용 테스트 진입입니다. 배포 기능이 아닙니다.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {LOCAL_QA_PRESETS.map((item) => (
                  <Button
                    key={item.preset}
                    type="button"
                    variant="secondary"
                    disabled={isBusy}
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => handleQuickLogin(item.preset)}
                  >
                    {quickLoginPreset === item.preset ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    <span>{item.label}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">{item.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isBusy}
            className="w-full gap-2"
            size="lg"
            variant="outline"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 계속하기
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            로컬 QA는 이메일/비밀번호 로그인으로도 진행할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
