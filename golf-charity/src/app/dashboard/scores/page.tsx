import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Calendar, CheckCircle2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { cn } from '@/lib/utils'

export default async function ScoresPage(props: { searchParams: Promise<{ message?: string, success?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: scores } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', user?.id)
    .order('date_played', { ascending: false })
    .limit(5)

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user?.id)
    .single()

  const isSubscribed = profile?.subscription_status === 'active'

  const addScore = async (formData: FormData) => {
    'use server'
    const score = parseInt(formData.get('score') as string)
    const date = formData.get('date') as string
    
    if (score < 1 || score > 45) return

    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user) return

    await sb.from('golf_scores').insert({
      user_id: user.id,
      score: score,
      date_played: date
    })

    revalidatePath('/dashboard/scores')
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Scores</h1>
        <p className="text-muted-foreground mt-1">Keep your last 5 Stableford scores updated to remain eligible for the latest draw.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border border-border/50 bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
           <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Add New Score</h3>
           <form action={addScore} className="space-y-4">
             <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Stableford Score (1 - 45)</label>
                <Input type="number" name="score" min="1" max="45" required placeholder="Ex: 36" disabled={!isSubscribed} />
             </div>
             <div>
                <label className="text-sm text-muted-foreground font-medium mb-1 block">Date Played</label>
                <Input type="date" name="date" required disabled={!isSubscribed} defaultValue={new Date().toISOString().split('T')[0]} />
             </div>
             <Button type="submit" className="w-full" disabled={!isSubscribed}>
                Submit Score
             </Button>

             {!isSubscribed && (
               <p className="text-xs text-destructive text-center mt-2 font-medium bg-destructive/10 p-2 rounded">
                 You must have an active subscription to log scores.
               </p>
             )}
           </form>
        </div>

        <div className="md:col-span-2">
           <Card className="h-full">
             <CardHeader>
               <CardTitle>Rolling 5 History</CardTitle>
             </CardHeader>
             <CardContent>
                {scores && scores.length > 0 ? (
                  <div className="space-y-4">
                     {scores.map((s, idx) => (
                       <div key={s.id} className={cn("flex items-center justify-between p-4 rounded-lg border transition-colors", idx === 0 ? "border-primary/50 bg-primary/5" : "border-border/50 bg-muted/10")}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold pb-0.5">
                                {s.score}
                             </div>
                             <div>
                               <p className="font-medium flex items-center gap-2">
                                 {idx === 0 && <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">Latest</span>}
                                 Stableford Points
                               </p>
                               <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                 <Calendar className="h-3 w-3" /> {s.date_played}
                               </p>
                             </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-80" />
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg">
                     No scores found.
                  </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
