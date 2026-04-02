import { redirect } from 'next/navigation'

import { AuthLoginForm } from '@/components/auth-login-form'
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
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <AuthLoginForm />
    </main>
  )
}
