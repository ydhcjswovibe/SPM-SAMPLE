import { MobileNav } from '@/components/mobile-nav'
import { DesktopSidebar } from '@/components/desktop-sidebar'
import { AccessGateCard } from '@/components/access-gate-card'
import { getRoleLabel, isAdminRole } from '@/lib/auth/roles'
import { getServerAccessContext } from '@/lib/auth/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await getServerAccessContext()

  if (!access.isAuthenticated) {
    return (
      <AccessGateCard
        title="관리자 로그인이 필요합니다"
        description="관리자 화면은 로그인한 운영 계정만 사용할 수 있습니다."
        primaryHref="/auth/login"
        primaryLabel="로그인하기"
        secondaryHref="/"
        secondaryLabel="처음으로"
      />
    )
  }

  if (!isAdminRole(access.role)) {
    const hasKnownRole = Boolean(access.role)

    return (
      <AccessGateCard
        title={hasKnownRole ? '관리자 권한이 필요합니다' : '프로필 권한을 확인할 수 없습니다'}
        description={
          hasKnownRole
            ? '현재 계정은 학생 전용 화면으로 분류되어 관리자 화면을 열 수 없습니다.'
            : '현재 계정의 역할 정보가 없어서 관리자 화면을 열 수 없습니다.'
        }
        primaryHref={hasKnownRole ? '/student' : '/auth/login'}
        primaryLabel={hasKnownRole ? '학생 화면으로 이동' : '다시 로그인하기'}
        secondaryHref="/"
        secondaryLabel="처음으로"
        detail={`현재 계정: ${access.email ?? '알 수 없음'} / 역할: ${getRoleLabel(access.role)}`}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#deeffa_0%,#fffdf5_42%,#edf6df_100%)] md:grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <DesktopSidebar />
      <main className="relative z-10 min-w-0 pb-24 md:min-h-dvh md:pb-8">
        <div className="w-full md:mx-auto md:max-w-[60rem] lg:max-w-[72rem] xl:max-w-[76rem] 2xl:max-w-[80rem]">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
