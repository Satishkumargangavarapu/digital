import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, ArrowUpRight, Activity, Heart, Target } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage(props: { searchParams?: Promise<{ success?: string, session_id?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (searchParams?.success === 'true' && searchParams?.session_id && user) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      if (session.payment_status === 'paid') {
        const { error } = await supabase.from('profiles').update({
          subscription_status: 'active'
        }).eq('id', user.id)
        if (error) console.error('Dashboard profile update failed:', error)
      }
    } catch (e) {
      console.error('Failed to verify session:', e)
    }
    
    redirect('/dashboard')
  }

  const { data: profile } = await supabase.from('profiles').select('*, charity:charities(name), winnings(*), draw_entries(*), golf_scores(*)').eq('id', user?.id).single()
  
  const scores = profile?.golf_scores?.sort((a: any, b: any) => new Date(b.date_played).getTime() - new Date(a.date_played).getTime()) || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name || 'Golfer'}. Here is your overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{profile?.subscription_status || 'None'}</div>
            <p className="text-xs text-muted-foreground mt-1 text-primary">Active Plan: {profile?.subscription_tier || 'N/A'}</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profile?.winnings?.filter((w: any) => w.payout_status === 'paid').reduce((acc: number, w: any) => acc + Number(w.prize_amount), 0).toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payout: ${profile?.winnings?.filter((w: any) => ['pending_proof', 'pending_review', 'approved'].includes(w.payout_status)).reduce((acc: number, w: any) => acc + Number(w.prize_amount), 0).toFixed(2) || '0.00'}</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-pink-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported Charity</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold truncate">{profile?.charity?.name || 'Not Selected'}</div>
            <p className="text-xs text-muted-foreground mt-1">Contribution: {profile?.charity_contribution_percentage}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draw Participation</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.draw_entries?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Historical Draw Entries</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
         <h2 className="text-xl font-bold tracking-tight mb-4">Latest Registered Scores</h2>
         {scores.length > 0 ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
             {scores.map((s: any, idx: number) => (
               <Card key={s.id} className="p-4 flex items-center gap-4 bg-muted/20 border-border/50">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                   {s.score}
                 </div>
                 <div>
                   <p className="font-bold">Stableford</p>
                   <p className="text-xs text-muted-foreground">{new Date(s.date_played).toLocaleDateString()}</p>
                 </div>
               </Card>
             ))}
           </div>
         ) : (
           <Card className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center border-dashed">
             <Target className="h-10 w-10 mx-auto mb-4 opacity-20" />
             <p>No scores logged yet.</p>
             <p className="text-sm mt-1">Head over to My Scores to enter your first round.</p>
           </Card>
         )}
      </div>
    </div>
  )
}
