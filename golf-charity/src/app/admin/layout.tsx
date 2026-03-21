import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, Users, Trophy, Heart, Settings, LayoutDashboard } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

  if (!profile?.is_admin) {
    return redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-muted/10 flex flex-col pt-10 px-6 hidden md:flex">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter mb-12">
          <Target className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Reports Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Users className="h-4 w-4" /> Users
          </Link>
          <Link href="/admin/draws" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Trophy className="h-4 w-4" /> Draw Engine
          </Link>
          <Link href="/admin/charities" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Heart className="h-4 w-4" /> Charities
          </Link>
          <Link href="/admin/verify" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Target className="h-4 w-4" /> Winner Verification
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        <div className="md:hidden flex h-16 border-b border-border/50 items-center px-6 justify-between">
           <Link href="/" className="font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Admin</Link>
        </div>
        <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
