import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GraduationCap, Settings, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDefaultRouteForRole } from '@/lib/auth/roles'
import { getServerAccessContext } from '@/lib/auth/server'

export default async function HomePage() {
  const access = await getServerAccessContext()

  if (access.isAuthenticated) {
    if (access.role) {
      redirect(getDefaultRouteForRole(access.role))
    }

    redirect('/auth/error?message=프로필 역할을 확인할 수 없습니다')
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SPM</h1>
          <p className="text-muted-foreground">교육 운영 관리 도구</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">로그인 후 시작합니다</h2>
            <p className="text-sm text-muted-foreground">
              로그인하면 계정 역할에 맞는 화면으로 자동 이동합니다.
            </p>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login">로그인하기</Link>
          </Button>
        </div>

        <div className="mx-auto grid max-w-sm gap-3">
          <Link
            href="/admin"
            className="group block rounded-2xl focus-visible:outline-none"
          >
            <Card className="border-2 transition-all hover:border-primary/60 hover:bg-accent/30 group-focus-visible:border-primary/60 group-focus-visible:bg-accent/30 group-focus-visible:shadow-sm">
              <CardHeader className="items-center gap-3 px-5 py-5 text-center">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">운영 화면</CardTitle>
                  <CardDescription className="text-sm">운영, 학생, 수업 관리</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link
            href="/student"
            className="group block rounded-2xl focus-visible:outline-none"
          >
            <Card className="border-2 transition-all hover:border-primary/60 hover:bg-accent/30 group-focus-visible:border-primary/60 group-focus-visible:bg-accent/30 group-focus-visible:shadow-sm">
              <CardHeader className="items-center gap-3 px-5 py-5 text-center">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">학생 화면</CardTitle>
                  <CardDescription className="text-sm">등록된 수업과 주차별 콘텐츠 확인</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          이메일 또는 Google 로그인 후 계정 역할에 맞는 화면으로 이동합니다.
        </p>
      </div>
    </div>
  )
}
