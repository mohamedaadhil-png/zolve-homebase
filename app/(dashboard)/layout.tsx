import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('name, email, avatar_url, onboarding_complete')
    .eq('id', user.id)
    .single()

  const navUser = {
    name: userData?.name ?? 'User',
    email: userData?.email ?? '',
    avatarUrl: userData?.avatar_url ?? undefined,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navbar + global search */}
      <TopBar user={navUser} />

      <div className="flex pt-14">
        {/* Left Sidebar — hidden on mobile */}
        <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-slate-100 z-30">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-60 min-h-[calc(100vh-3.5rem)] pb-20 md:pb-0 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
    </div>
  )
}
