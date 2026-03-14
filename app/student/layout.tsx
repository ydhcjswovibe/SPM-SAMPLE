import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentNav } from '@/components/student-nav'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // If user is admin, redirect to admin dashboard
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="min-h-dvh bg-background">
      <StudentNav userName={profile?.full_name || user.email || ''} />
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}
