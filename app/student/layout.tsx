import { StudentNav } from '@/components/student-nav'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Demo mode - skip auth check
  return (
    <div className="min-h-dvh bg-background">
      <StudentNav userName="데모 학생" />
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}
