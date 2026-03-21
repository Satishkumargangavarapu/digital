import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, RefreshCw, CheckCircle2, Calculator } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'

export default async function AdminDrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: draws } = await supabaseAdmin.from('draws').select('*').order('created_at', { ascending: false })
  
  const currentDraw = draws?.find((d: any) => d.status === 'pending' || d.status === 'simulated')

  const runSimulation = async (formData: FormData) => {
    'use server'
    const logic = formData.get('logic') as string

    const draw_numbers: number[] = [];
    while(draw_numbers.length < 5) {
      const r = Math.floor(Math.random() * 45) + 1;
      if(draw_numbers.indexOf(r) === -1) draw_numbers.push(r);
    }

    const total_prize_pool = 15400.00;
    const jackpot_amount = total_prize_pool * 0.40;

    const { data: active } = await supabaseAdmin.from('draws')
       .select('*')
       .in('status', ['pending', 'simulated'])
       .single()

    if (active) {
       await supabaseAdmin.from('draws').update({
         status: 'simulated',
         draw_logic: logic,
         draw_numbers,
         total_prize_pool,
         jackpot_amount
       }).eq('id', active.id)
    } else {
       await supabaseAdmin.from('draws').insert({
         month: new Date().toISOString().split('T')[0],
         status: 'simulated',
         draw_logic: logic,
         draw_numbers,
         total_prize_pool,
         jackpot_amount
       })
    }

    revalidatePath('/admin/draws')
  }

  const publishDraw = async (formData: FormData) => {
    'use server'
    const drawId = formData.get('draw_id') as string

    const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', drawId).single()
    if (!draw) return;

    const { data: entries } = await supabaseAdmin.from('draw_entries').select('*').eq('draw_id', drawId)
    
    let match5Winners: string[] = [];
    let match4Winners: string[] = [];
    let match3Winners: string[] = [];

    if (entries) {
      entries.forEach((entry: any) => {
        let matchCount = 0;
        entry.entry_numbers.forEach((n: number) => {
          if (draw.draw_numbers.includes(n)) matchCount++;
        });

        if (matchCount === 5) match5Winners.push(entry.user_id);
        else if (matchCount === 4) match4Winners.push(entry.user_id);
        else if (matchCount === 3) match3Winners.push(entry.user_id);
      });
    }

    const insertWinnings = async (winners: string[], matchType: number, poolShare: number) => {
      if (winners.length > 0) {
        const amountPerWinner = poolShare / winners.length;
        for (const uid of winners) {
          await supabaseAdmin.from('winnings').insert({
            draw_id: drawId,
            user_id: uid,
            match_type: matchType,
            prize_amount: amountPerWinner,
            payout_status: 'pending_proof'
          });
          const { data: p } = await supabaseAdmin.from('profiles').select('email').eq('id', uid).single();
          if (p?.email) {
            await sendEmail({
              to: p.email,
              subject: 'You Won in the Golf Charity Draw!',
              html: `<p>Congratulations! You matched ${matchType} numbers and won $${amountPerWinner.toFixed(2)}. Please log in to your dashboard to claim your prize.</p>`
            });
          }
        }
      }
    };

    const match4_pool = draw.total_prize_pool * 0.35;
    const match3_pool = draw.total_prize_pool * 0.25;

    await insertWinnings(match5Winners, 5, draw.jackpot_amount);
    await insertWinnings(match4Winners, 4, match4_pool);
    await insertWinnings(match3Winners, 3, match3_pool);

    await supabaseAdmin.from('draws').update({
       status: 'published'
    }).eq('id', drawId)

    const { data: activeSubs } = await supabaseAdmin.from('profiles').select('email').eq('subscription_status', 'active')
    
    if (activeSubs) {
      for (const sub of activeSubs) {
         await sendEmail({
           to: sub.email,
           subject: 'Latest Draw Results are In!',
           html: `<p>The latest monthly draw has been published. The winning numbers are ${draw.draw_numbers.join(', ')}. Log in to see if you won!</p>`
         })
      }
    }

    revalidatePath('/admin/draws')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draw Engine</h1>
          <p className="text-muted-foreground mt-1">Run simulations and publish monthly draw results.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <Card className="border-accent/40 bg-accent/5">
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" /> Run Simulation</CardTitle>
               <CardDescription>Calculate distributions before publishing to users. Pool split: 40% (Jackpot), 35% (4-Match), 25% (3-Match).</CardDescription>
             </CardHeader>
             <CardContent>
               <form action={runSimulation} className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-muted-foreground mb-2 block">Generation Logic</label>
                   <select name="logic" className="w-full flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent">
                     <option value="random">Standard Random</option>
                     <option value="algorithmic">Algorithmic (Weighted)</option>
                   </select>
                 </div>
                 <Button type="submit" variant="outline" className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-white">
                   <RefreshCw className="h-4 w-4" /> Simulate Draw
                 </Button>
               </form>
             </CardContent>
           </Card>

           {currentDraw?.status === 'simulated' && (
             <Card className="border-emerald-500/40 bg-emerald-500/5">
               <CardHeader>
                 <CardTitle className="text-emerald-500">Publish Results</CardTitle>
                 <CardDescription>Evaluate winners and send emails.</CardDescription>
               </CardHeader>
               <CardContent>
                 <form action={publishDraw}>
                   <input type="hidden" name="draw_id" value={currentDraw.id} />
                   <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold">
                     <CheckCircle2 className="h-4 w-4" /> Publish to Users
                   </Button>
                 </form>
               </CardContent>
             </Card>
           )}
        </div>

        <div className="md:col-span-2">
           <Card className="h-full">
             <CardHeader>
               <CardTitle>Draw History & Active Simulations</CardTitle>
             </CardHeader>
             <CardContent>
                {draws && draws.length > 0 ? (
                  <div className="space-y-4">
                     {draws.map((d: any) => (
                       <div key={d.id} className="p-4 rounded-lg border border-border/50 bg-background/50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                               <h4 className="font-bold text-lg">{new Date(d.month).toLocaleDateString('default', { month: 'long', year: 'numeric'})} Draw</h4>
                               {d.status === 'published' && <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">Published</span>}
                               {d.status === 'simulated' && <span className="text-[10px] uppercase font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full">Simulated</span>}
                               {d.status === 'pending' && <span className="text-[10px] uppercase font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Pending</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">Logic: <span className="capitalize">{d.draw_logic}</span> | Pool: ${Number(d.total_prize_pool).toFixed(2)}</p>
                          </div>
                          
                          {d.draw_numbers && (
                            <div className="flex gap-2">
                               {d.draw_numbers.map((n: number, i: number) => (
                                 <div key={i} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                                   {n}
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg">
                     No draws configured yet.
                  </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
