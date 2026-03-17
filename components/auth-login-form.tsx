'use client'

import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SpmMascot } from '@/components/spm-mascot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, Lock, Mail, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

const LOCAL_QA_PRESETS = [
  { preset: 'OWNER', label: '오너', description: 'owner 권한 확인' },
  { preset: 'ADMIN', label: '운영', description: 'admin 운영 화면 확인' },
  { preset: 'STUDENT', label: '학생', description: 'student 화면 확인' },
] as const

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdConfiguration = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  context?: 'signin' | 'signup' | 'use'
}

type GoogleButtonConfiguration = {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: string
  logo_alignment?: 'left' | 'center'
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize(config: GoogleIdConfiguration): void
          renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void
        }
      }
    }
  }
}

export function AuthLoginForm() {
  const router = useRouter()
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? ''
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false)
  const [hasGoogleScriptError, setHasGoogleScriptError] = useState(false)
  const [quickLoginPreset, setQuickLoginPreset] = useState<string | null>(null)
  const [isLocalRuntime] = useState(
    () => typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'),
  )
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isBusy = isLoading || isGoogleLoading || quickLoginPreset !== null
  const isGoogleConfigured = googleClientId.length > 0

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

    startTransition(() => {
      router.replace('/')
      router.refresh()
    })
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

      const redirectTo = payload.data.redirectTo

      startTransition(() => {
        router.replace(redirectTo)
        router.refresh()
      })
    } catch {
      setError('LOCAL_RUNTIME_LOGIN_FAILED')
      setQuickLoginPreset(null)
    }
  }

  const handleGoogleRedirectLogin = async () => {
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

  const handleGoogleCredential = useEffectEvent(async (response: GoogleCredentialResponse) => {
    const credential = response.credential?.trim()

    if (!credential) {
      setError('Google 로그인 토큰을 확인할 수 없습니다.')
      setIsGoogleLoading(false)
      return
    }

    setIsGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    })

    if (signInError) {
      setError(signInError.message)
      setIsGoogleLoading(false)
      return
    }

    startTransition(() => {
      router.replace('/')
      router.refresh()
    })
  })

  useEffect(() => {
    if (!isGoogleConfigured) return

    if (!isGoogleScriptLoaded || hasGoogleScriptError) {
      return
    }

    const googleId = window.google?.accounts?.id
    const googleButton = googleButtonRef.current

    if (!googleId || !googleButton) {
      return
    }

    googleId.initialize({
      client_id: googleClientId,
      callback: (response) => {
        void handleGoogleCredential(response)
      },
      context: 'signin',
    })

    googleButton.innerHTML = ''
    googleId.renderButton(googleButton, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: String(Math.max(280, Math.min(googleButton.clientWidth || 320, 360))),
    })
  }, [googleClientId, hasGoogleScriptError, isGoogleConfigured, isGoogleScriptLoaded])

  return (
    <div className="min-h-dvh px-4 py-8 md:px-6">
      {isGoogleConfigured ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            setIsGoogleScriptLoaded(true)
            setHasGoogleScriptError(false)
          }}
          onError={() => {
            setError('Google 로그인 준비에 실패했습니다.')
            setHasGoogleScriptError(true)
          }}
        />
      ) : null}

      <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="spm-hero-panel overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-4">
              <p className="spm-kicker">Cute Ops Toolkit</p>
              <div className="space-y-3">
                <h1 className="spm-display max-w-[10ch] text-5xl leading-none text-foreground sm:text-6xl">
                  반갑게 시작하고, 안전하게 운영해요.
                </h1>
                <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                  듀오링고 같은 경쾌한 리듬을 참고하되, 실제 운영과 학습 흐름은 SPM 규칙에 맞게 읽히는 로그인 진입 화면입니다.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border-2 border-white/80 bg-white/80 p-4 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-secondary-foreground">Login</p>
                  <p className="mt-2 font-bold text-foreground">이메일과 Google 진입을 같은 카드에서 분명하게 구분합니다.</p>
                </div>
                <div className="rounded-[1.25rem] border-2 border-white/80 bg-white/80 p-4 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--primary-shadow)]">Mobile First</p>
                  <p className="mt-2 font-bold text-foreground">작은 화면에서도 주요 CTA가 첫눈에 들어오도록 정렬합니다.</p>
                </div>
                <div className="rounded-[1.25rem] border-2 border-white/80 bg-white/80 p-4 shadow-[0_4px_0_rgba(255,255,255,0.72)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-accent-foreground">Quick QA</p>
                  <p className="mt-2 font-bold text-foreground">로컬 확인용 프리셋 진입은 별도 블록으로 분리합니다.</p>
                </div>
              </div>
            </div>
            <div className="justify-self-center">
              <SpmMascot variant="welcome" size="lg" />
            </div>
          </div>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.3rem] border-2 border-[var(--line-strong)] bg-white shadow-[0_5px_0_var(--line-strong)]">
              <span className="spm-display text-2xl text-secondary-foreground">S</span>
            </div>
            <div className="space-y-2">
              <p className="spm-kicker">Welcome Back</p>
              <CardTitle className="spm-display text-4xl text-foreground">SPM</CardTitle>
              <CardDescription className="mx-auto max-w-sm text-base">
                교육 운영 관리 시스템에 로그인하고, 현재 역할에 맞는 화면으로 바로 이동합니다.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {error ? (
              <div className="rounded-[1.2rem] border-2 border-destructive/30 bg-[#fff0ef] p-4 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-foreground">이메일</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-foreground">비밀번호</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="비밀번호를 입력해 주세요"
                    className="pl-11"
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

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-dashed border-[var(--line-strong)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="rounded-full bg-card px-3 text-muted-foreground">또는</span>
              </div>
            </div>

            {isGoogleConfigured ? (
              hasGoogleScriptError ? (
                <div className="space-y-2">
                  <Button
                    onClick={handleGoogleRedirectLogin}
                    disabled={isBusy}
                    className="w-full gap-2"
                    size="lg"
                    variant="outline"
                  >
                    {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Google로 계속하기
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Google 표면을 불러오지 못해 기본 로그인으로 전환합니다.
                  </p>
                </div>
              ) : (
                <div className="relative rounded-[1.2rem] border-2 border-[var(--line-strong)] bg-white p-2 shadow-[0_4px_0_var(--line-strong)]">
                  <div
                  ref={googleButtonRef}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-center rounded-[0.9rem]',
                    isBusy ? 'pointer-events-none opacity-70' : null,
                  )}
                />
                  {!isGoogleScriptLoaded || isGoogleLoading ? (
                    <div className="absolute inset-2 flex items-center justify-center rounded-[0.9rem] bg-card/90">
                      {isGoogleLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Google 로그인 중...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Google 로그인 준비 중...</span>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <Button
                onClick={handleGoogleRedirectLogin}
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
            )}

            {isLocalRuntime ? (
              <div className="spm-grid-dots rounded-[1.5rem] border-2 border-dashed border-[var(--line-strong)] bg-[#fffdf5] p-4">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary-foreground" />
                  <p className="font-black text-foreground">로컬 QA 원클릭 로그인</p>
                </div>
                <p className="mb-4 text-center text-xs text-muted-foreground">
                  localhost 전용 테스트 진입입니다. 배포 기능이 아닙니다.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {LOCAL_QA_PRESETS.map((item) => (
                    <Button
                      key={item.preset}
                      type="button"
                      variant={item.preset === 'ADMIN' ? 'secondary' : 'outline'}
                      disabled={isBusy}
                      className="h-auto flex-col gap-1 py-3"
                      onClick={() => handleQuickLogin(item.preset)}
                    >
                      {quickLoginPreset === item.preset ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      <span>{item.label}</span>
                      <span className="text-[11px] font-bold text-muted-foreground">{item.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                로컬 QA는 이메일/비밀번호 로그인으로도 진행할 수 있습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
