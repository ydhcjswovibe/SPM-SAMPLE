import { StudentNav } from '@/components/student-nav'
import { AccessGateCard } from '@/components/access-gate-card'
import { getRoleLabel, isStudentRole } from '@/lib/auth/roles'
import { getServerAccessContext } from '@/lib/auth/server'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await getServerAccessContext()

  if (!access.isAuthenticated) {
    return (
      <AccessGateCard
        title="학생 로그인이 필요합니다"
        description="학생 화면은 로그인한 수강생 계정만 사용할 수 있습니다."
        primaryHref="/auth/login"
        primaryLabel="로그인하기"
        secondaryHref="/"
        secondaryLabel="처음으로"
      />
    )
  }

  if (!isStudentRole(access.role)) {
    const hasKnownRole = Boolean(access.role)

    return (
      <AccessGateCard
        title={hasKnownRole ? '학생 전용 화면입니다' : '프로필 권한을 확인할 수 없습니다'}
        description={
          hasKnownRole
            ? '현재 계정은 운영 화면으로 이동해야 합니다.'
            : '현재 계정의 역할 정보가 없어서 학생 화면을 열 수 없습니다.'
        }
        primaryHref={hasKnownRole ? '/admin' : '/auth/login'}
        primaryLabel={hasKnownRole ? '운영 화면으로 이동' : '다시 로그인하기'}
        secondaryHref="/"
        secondaryLabel="처음으로"
        detail={`현재 계정: ${access.email ?? '알 수 없음'} / 역할: ${getRoleLabel(access.role)}`}
      />
    )
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
