'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '알 수 없는 오류가 발생했습니다'

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background px-4 py-4 sm:py-6">
      <section className="w-full max-w-[22rem] rounded-[1.5rem] border border-[var(--border)] bg-white/96 px-5 py-5 text-center shadow-[0_18px_34px_rgba(88,109,66,0.1)] backdrop-blur-[2px] sm:max-w-[23rem] sm:rounded-[1.7rem] sm:px-6">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 sm:mb-4 sm:h-12 sm:w-12">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl">인증 오류</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">문제가 계속되면 관리자에게 문의하세요.</p>
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인으로 돌아가기
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center bg-background px-4 py-4 sm:py-6">
          <div className="animate-pulse text-muted-foreground">로딩중...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
