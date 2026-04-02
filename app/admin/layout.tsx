import { redirect } from 'next/navigation'

import { MobileNav } from '@/components/mobile-nav'
import { DesktopSidebar } from '@/components/desktop-sidebar'
import { getDefaultRouteForRole, isAdminRole } from '@/lib/auth/roles'
import { getServerAccessContext } from '@/lib/auth/server'

export default async function AdminLayout({
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

  if (!isAdminRole(access.role)) {
    redirect(getDefaultRouteForRole(access.role))
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#deeffa_0%,#fffdf5_42%,#edf6df_100%)]">
      <div className="md:flex">
        <DesktopSidebar />
        <main className="relative z-10 min-w-0 flex-1 pb-24 md:min-h-dvh md:pb-8 md:pr-6 lg:pr-7 xl:pr-8">
          <div className="w-full md:mr-auto md:max-w-[56rem] lg:max-w-[64rem] xl:max-w-[70rem] 2xl:max-w-[74rem]">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
