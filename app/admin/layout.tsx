import { MobileNav } from '@/components/mobile-nav'
import { DesktopSidebar } from '@/components/desktop-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Demo mode - skip auth check
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
