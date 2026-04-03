import { redirect } from 'next/navigation'

import { StudentNav } from '@/components/student-nav'
import { getDefaultRouteForRole, isStudentRole } from '@/lib/auth/roles'
import { getServerAccessContext } from '@/lib/auth/server'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await getServerAccessContext()

  if (!access.isAuthenticated) {
    redirect('/')
  }

  if (!access.role) {
    redirect('/auth/error?message=프로필 역할을 확인할 수 없습니다')
  }

  if (!isStudentRole(access.role)) {
    redirect(getDefaultRouteForRole(access.role))
  }

  const userName = access.fullName ?? access.email?.split('@')[0] ?? '학생'

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#d6edf8_0%,#ddefc5_34%,#b1d86e_100%)]">
      <StudentNav userName={userName} />
      <main className="relative">
        {children}
      </main>
    </div>
  )
}
