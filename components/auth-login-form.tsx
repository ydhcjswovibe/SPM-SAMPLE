'use client'

import { startTransition, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getPublicGoogleClientId, isLocalRuntimeHostname } from '@/lib/env/client'
import { createClient } from '@/lib/supabase/client'
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

function subscribeToClientState() {
  return () => undefined
}

function readLocalRuntimeSnapshot() {
  if (typeof window === 'undefined') {
    return false
  }

  return isLocalRuntimeHostname(window.location.hostname)
}

export function AuthLoginForm() {
  const router = useRouter()
  const googleClientId = getPublicGoogleClientId()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [googleButtonWidth, setGoogleButtonWidth] = useState<number | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(window.google?.accounts?.id)
  })
  const [hasGoogleScriptError, setHasGoogleScriptError] = useState(false)
  const [quickLoginPreset, setQuickLoginPreset] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isBusy = isGoogleLoading || quickLoginPreset !== null
  const isGoogleConfigured = googleClientId.length > 0
  const isGoogleUnavailable = !isGoogleConfigured || hasGoogleScriptError
  const isLocalRuntime = useSyncExternalStore(
    subscribeToClientState,
    readLocalRuntimeSnapshot,
    () => false,
  )

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
    const googleButton = googleButtonRef.current

    if (!googleButton) {
      return
    }

    const syncWidth = () => {
      const nextWidth = Math.floor(googleButton.clientWidth)

      setGoogleButtonWidth((currentWidth) => {
        if (currentWidth === nextWidth) {
          return currentWidth
        }

        return nextWidth
      })
    }

    syncWidth()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        syncWidth()
      })

      observer.observe(googleButton)

      return () => {
        observer.disconnect()
      }
    }

    window.addEventListener('resize', syncWidth)

    return () => {
      window.removeEventListener('resize', syncWidth)
    }
  }, [])

  useEffect(() => {
    if (!isGoogleConfigured) return
    if (!isGoogleScriptLoaded || hasGoogleScriptError) return
    if (!googleButtonWidth || googleButtonWidth < 120) return

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
      width: String(googleButtonWidth),
    })
  }, [
    googleButtonWidth,
    googleClientId,
    hasGoogleScriptError,
    isGoogleConfigured,
    isGoogleScriptLoaded,
  ])

  return (
    <div style={{ width: '100%', maxWidth: '21rem' }}>
      {isGoogleConfigured ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            setIsGoogleScriptLoaded(Boolean(window.google?.accounts?.id))
            setHasGoogleScriptError(false)
          }}
          onError={() => {
            setIsGoogleScriptLoaded(false)
            setHasGoogleScriptError(true)
          }}
        />
      ) : null}

      <div className="mb-3 text-center">
        <p className="text-[0.78rem] font-bold tracking-[0.3em] text-[#728068]">Social Plus</p>
      </div>

      <section className="rounded-[1.5rem] border border-[#d9e3d0] bg-white px-4 py-4 shadow-[0_18px_34px_rgba(88,109,66,0.1)] sm:rounded-[1.7rem] sm:px-5 sm:py-5">
        <div className="space-y-3.5">
          {error ? (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-[1.4rem] border border-[rgba(214,104,96,0.26)] bg-[#fff3f1] p-4 text-sm text-[#b65046]"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          {isGoogleUnavailable ? (
            <div className="rounded-[1.1rem] border border-[#dce5d4] bg-[#f7fbf3] px-4 py-3.5 text-center sm:px-5 sm:py-4">
              <p className="text-base font-semibold tracking-[-0.02em] text-[#314127]">
                {hasGoogleScriptError
                  ? 'Google 로그인 준비에 문제가 있습니다.'
                  : 'Google 로그인 설정이 아직 연결되지 않았습니다.'}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f7c66]">
                {hasGoogleScriptError
                  ? '잠시 후 다시 시도해 주세요. 설정이 연결된 환경에서 로그인할 수 있습니다.'
                  : isLocalRuntime
                    ? '로컬에서는 아래 QA 로그인으로 바로 확인할 수 있습니다.'
                    : 'Google 로그인 설정이 연결된 환경에서 다시 시도해 주세요.'}
              </p>
            </div>
          ) : (
            <div className="relative rounded-[1.2rem] border border-[#d6e1ca] bg-[#fbfcf8] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div
                ref={googleButtonRef}
                className={cn(
                  'flex min-h-[3rem] w-full items-center justify-center rounded-[1rem]',
                  isBusy ? 'pointer-events-none opacity-70' : null,
                )}
              />
              {!isGoogleScriptLoaded || isGoogleLoading ? (
                <div className="absolute inset-2 flex items-center justify-center rounded-[1rem] bg-white">
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[#77808a]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Google 로그인 중…</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#77806c]">Google 로그인 준비 중…</span>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {isLocalRuntime ? (
            <div className="border-t border-[#edf1e7] pt-3.5">
              <details className="rounded-[1rem] border border-[#d6e1ca] bg-[#fbfcf8] p-3 sm:p-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#7d9fe7]" />
                    <p className="text-sm font-semibold text-[#314127]">로컬 QA 원클릭 로그인</p>
                  </div>
                  <span className="text-xs font-semibold text-[#7a816f]">열기</span>
                </summary>
                <p className="mt-3 text-xs leading-5 text-[#77806c]">
                  localhost 전용 테스트 진입입니다. 배포 기능이 아닙니다.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {LOCAL_QA_PRESETS.map((item) => (
                    <Button
                      key={item.preset}
                      type="button"
                      variant={item.preset === 'ADMIN' ? 'secondary' : 'outline'}
                      disabled={isBusy}
                      className="h-auto flex-col gap-1 rounded-[0.95rem] border-[#d6e1ca] bg-white py-2.5 text-[#4e6242]"
                      onClick={() => handleQuickLogin(item.preset)}
                    >
                      {quickLoginPreset === item.preset ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      <span>{item.label}</span>
                      <span className="text-[11px] font-bold text-[#7a816f]">{item.description}</span>
                    </Button>
                  ))}
                </div>
              </details>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
