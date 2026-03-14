import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Settings, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SPM</h1>
          <p className="text-muted-foreground">교육 운영 관리 시스템</p>
        </div>

        <div className="space-y-3">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <Link href="/admin" className="block">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">관리자 모드</CardTitle>
                    <CardDescription>클래스, 학생, 콘텐츠 관리</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <Link href="/student" className="block">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">학생 모드</CardTitle>
                    <CardDescription>수업 콘텐츠 확인</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          데모 모드 - 로그인 없이 둘러보기
        </p>
      </div>
    </div>
  )
}
