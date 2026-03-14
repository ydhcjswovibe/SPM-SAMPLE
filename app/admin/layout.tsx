import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from '@/components/mobile-nav'
import { DesktopSidebar } from '@/components/desktop-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/student')
  }

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />
      <main className="pb-20 md:pb-0 md:pl-64">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
