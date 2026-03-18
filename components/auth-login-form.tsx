'use client'

import { startTransition, useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SpmMascot } from '@/components/spm-mascot'
import { Button } from '@/components/ui/button'
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

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isBusy) {
      return
    }

    void handlePasswordLogin()
  }

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
    <div className="min-h-dvh bg-[linear-gradient(180deg,#f4efe7_0%,#f8f5ef_100%)] px-4 py-4 sm:px-6 sm:py-6">
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

      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-6xl flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] lg:items-stretch lg:gap-6">
        <section className="order-2 overflow-hidden rounded-[2.35rem] border border-[rgba(255,255,255,0.08)] bg-[#18212a] px-5 py-6 text-white shadow-[0_28px_80px_rgba(14,19,26,0.22)] lg:order-1 lg:px-7 lg:py-7">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7dd2c2]/18">
                  <SpmMascot size="sm" className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.14em] text-white/72">
                  로그인
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="spm-display max-w-[9ch] text-[clamp(2.3rem,6vw,5rem)] leading-[0.92] text-white">
                  한 번 로그인하면 바로 이어집니다
                </h1>
                <p className="max-w-md text-sm leading-6 text-white/72 sm:text-base">
                  같은 입구에서 학생과 운영 화면으로 나뉘고, 역할에 맞는 첫 화면으로 바로 들어갑니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9be5d8]">
                  학생
                </p>
                <p className="mt-2 text-sm leading-6 text-white/82">
                  선택한 수업과 주차 콘텐츠를 바로 이어서 확인합니다.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#a9c1ff]">
                  운영
                </p>
                <p className="mt-2 text-sm leading-6 text-white/82">
                  수업, 학생, 출석 관리 화면으로 곧바로 이동합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 rounded-[2.35rem] border border-[rgba(23,33,42,0.08)] bg-white/96 p-3 shadow-[0_28px_80px_rgba(21,28,38,0.14)] lg:order-2">
          <div className="rounded-[2rem] bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f3_100%)] px-5 py-5 sm:px-7 sm:py-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#7b8490]">
                  로그인
                </p>
                <div className="space-y-2">
                  <h2 className="spm-display text-[2.2rem] leading-none text-[#17212a]">SPM</h2>
                  <p className="max-w-sm text-sm leading-6 text-[#66707b]">
                    이메일 또는 Google 로그인으로 바로 들어갑니다.
                  </p>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[#eef8f4]">
                <SpmMascot size="sm" className="h-7 w-7" />
              </div>
            </div>

            <div className="space-y-5">
              {error ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-[1.25rem] border border-[rgba(214,104,96,0.26)] bg-[#fff3f1] p-4 text-sm text-[#b65046]"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              <form className="space-y-3" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#17212a]">이메일</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#88919b]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-[1.35rem] border border-[rgba(23,33,42,0.1)] bg-[#fbfaf7] pl-11 shadow-none focus-visible:ring-[3px] focus-visible:ring-[#79cfc0]/20"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#17212a]">비밀번호</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#88919b]" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호를 입력해 주세요…"
                      className="h-12 rounded-[1.35rem] border border-[rgba(23,33,42,0.1)] bg-[#fbfaf7] pl-11 shadow-none focus-visible:ring-[3px] focus-visible:ring-[#79cfc0]/20"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="h-12 w-full gap-2 rounded-[1.35rem] border-[#5fc3af] bg-[#6fd2bf] text-[#10211d] shadow-[0_8px_18px_rgba(111,210,191,0.32)] hover:bg-[#78dbc8]"
                  size="lg"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  이메일로 로그인
                </Button>
              </form>

              <div className="relative py-1.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[rgba(23,33,42,0.08)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="rounded-full bg-white px-3 text-[#8b949e]">또는</span>
                </div>
              </div>

              {isGoogleConfigured ? (
                hasGoogleScriptError ? (
                  <div className="space-y-2">
                    <Button
                      onClick={handleGoogleRedirectLogin}
                      disabled={isBusy}
                      className="h-12 w-full gap-2 rounded-[1.35rem]"
                      size="lg"
                      variant="outline"
                    >
                      {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Google로 계속하기
                    </Button>
                    <p className="text-center text-xs text-[#77808a]">
                      Google 표면을 불러오지 못해 기본 로그인으로 전환합니다.
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-[1.35rem] border border-[rgba(23,33,42,0.1)] bg-[#fbfaf7] p-2 shadow-none">
                    <div
                      ref={googleButtonRef}
                      className={cn(
                        'flex min-h-11 w-full items-center justify-center rounded-[1rem]',
                        isBusy ? 'pointer-events-none opacity-70' : null,
                      )}
                    />
                    {!isGoogleScriptLoaded || isGoogleLoading ? (
                      <div className="absolute inset-2 flex items-center justify-center rounded-[1rem] bg-white/92">
                        {isGoogleLoading ? (
                          <div className="flex items-center gap-2 text-sm text-[#77808a]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Google 로그인 중…</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#77808a]">Google 로그인 준비 중…</span>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              ) : (
                <Button
                  onClick={handleGoogleRedirectLogin}
                  disabled={isBusy}
                  className="h-12 w-full gap-2 rounded-[1.35rem]"
                  size="lg"
                  variant="outline"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
                <details className="rounded-[1.5rem] border border-[rgba(23,33,42,0.08)] bg-[#f8f6f1] p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#7398e6]" />
                      <p className="text-sm font-semibold text-[#17212a]">로컬 QA 원클릭 로그인</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7a828c]">열기</span>
                  </summary>
                  <p className="mt-4 text-xs leading-5 text-[#77808a]">
                    localhost 전용 테스트 진입입니다. 배포 기능이 아닙니다.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {LOCAL_QA_PRESETS.map((item) => (
                      <Button
                        key={item.preset}
                        type="button"
                        variant={item.preset === 'ADMIN' ? 'secondary' : 'outline'}
                        disabled={isBusy}
                        className="h-auto flex-col gap-1 rounded-[1.2rem] py-3"
                        onClick={() => handleQuickLogin(item.preset)}
                      >
                        {quickLoginPreset === item.preset ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        <span>{item.label}</span>
                        <span className="text-[11px] font-bold text-[#7a828c]">{item.description}</span>
                      </Button>
                    ))}
                  </div>
                </details>
              ) : (
                <p className="text-center text-xs text-[#77808a]">
                  로컬 QA는 이메일/비밀번호 로그인으로도 진행할 수 있습니다.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
