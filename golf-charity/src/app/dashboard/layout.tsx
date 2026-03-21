import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, User, Heart, Settings, LogOut, Trophy } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch profile to see subscription status
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-muted/20 flex flex-col pt-10 px-6 backdrop-blur-md hidden md:flex">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter mb-12">
          <Target className="h-6 w-6 text-primary" />
          <span>Swing &amp; Give</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium">
            <User className="h-4 w-4" /> Overview
          </Link>
          <Link href="/dashboard/scores" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Target className="h-4 w-4" /> My Scores
          </Link>
          <Link href="/dashboard/winnings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Trophy className="h-4 w-4" /> My Winnings
          </Link>
          <Link href="/dashboard/charity" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Heart className="h-4 w-4" /> Charity Impact
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>
        
        <div className="pb-8 pt-4 border-t border-border/50">
          <form action="/auth/signout" method="POST">
             <button type="submit" className="flex items-center gap-3 px-3 py-2 opacity-70 hover:opacity-100 cursor-pointer transition-opacity w-full text-left">
                <LogOut className="h-4 w-4" /> Sign Out
             </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <div className="md:hidden flex h-16 border-b border-border/50 items-center px-6 justify-between">
           <Link href="/" className="font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Swing &amp; Give</Link>
        </div>
        <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
          {profile?.subscription_status !== 'active' && (
            <div className="mb-8 p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold">Subscription Inactive</h4>
                <p className="text-sm opacity-90">To enter score draws and support charities, please activate your subscription.</p>
              </div>
              <Link href="/dashboard/subscribe" className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-md hover:bg-destructive/90 transition-colors shrink-0">
                Subscribe
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
