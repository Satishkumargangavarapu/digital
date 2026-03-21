import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trophy, FileWarning, CheckCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: winnings } = await supabase
    .from('winnings')
    .select(`*, draws(month)`)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const uploadProof = async (formData: FormData) => {
    'use server'
    const winningId = formData.get('winningId') as string
    const proofFile = formData.get('proofFile') as File
    
    if (!proofFile || proofFile.size === 0) return

    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user && winningId) {
       // Upload file to Supabase Storage
       const fileExt = proofFile.name.split('.').pop()
       const fileName = `${user.id}-${winningId}-${Date.now()}.${fileExt}`
       
       const { data: uploadData, error } = await sb.storage
         .from('winner-proofs')
         .upload(fileName, proofFile, {
           cacheControl: '3600',
           upsert: false
         })
         
       if (!error && uploadData) {
         const { data: publicUrlData } = sb.storage.from('winner-proofs').getPublicUrl(fileName)
         const proofUrl = publicUrlData.publicUrl

         await sb.from('winnings').update({
           proof_image_url: proofUrl,
           payout_status: 'pending_review'
         }).eq('id', winningId).eq('user_id', user.id)
       }

       revalidatePath('/dashboard/winnings')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Winnings</h1>
        <p className="text-muted-foreground mt-1">View your prize history and upload score proofs for verification.</p>
      </div>

      <div className="grid gap-6">
        {winnings && winnings.length > 0 ? (
          winnings.map((w: any) => (
            <Card key={w.id} className={w.payout_status === 'paid' ? 'border-primary/50' : ''}>
              <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-4">
                   <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Trophy className="h-6 w-6 text-accent" />
                   </div>
                   <div>
                      <h3 className="font-bold text-lg">{new Date(w.draws?.month).toLocaleDateString('default', { month: 'long', year: 'numeric'})} Draw</h3>
                      <p className="text-muted-foreground text-sm">Matched {w.match_type} numbers • Prize: <span className="font-bold text-foreground">${w.prize_amount}</span></p>
                      
                      <div className="mt-2 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
                        Status: <span className="uppercase tracking-wider">{w.payout_status.replace('_', ' ')}</span>
                      </div>
                   </div>
                </div>

                <div className="w-full md:w-auto shrink-0 md:min-w-[300px]">
                   {w.payout_status === 'pending_proof' || w.payout_status === 'rejected' ? (
                     <form action={uploadProof} className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border/50">
                        {w.payout_status === 'rejected' && (
                          <p className="text-xs text-destructive font-semibold flex items-center gap-1"><FileWarning className="w-3 h-3"/> Previous proof rejected. Upload a clear valid image.</p>
                        )}
                        <p className="text-xs text-muted-foreground">Please upload a screenshot of your valid physical or digital scorecard for this period.</p>
                        <input type="hidden" name="winningId" value={w.id} />
                        <Input type="file" name="proofFile" accept="image/png, image/jpeg, image/jpg" required className="cursor-pointer" />
                        <Button type="submit" size="sm" className="w-full">Upload Proof</Button>
                     </form>
                   ) : w.payout_status === 'pending_review' ? (
                     <div className="p-4 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-sm text-center font-medium">
                        Proof submitted. Under review by Admin.
                     </div>
                   ) : w.payout_status === 'approved' ? (
                     <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm text-center font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Proof Approved. Processing Payout...
                     </div>
                   ) : w.payout_status === 'paid' ? (
                     <div className="p-4 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm text-center font-bold flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Funds Transferred Successfully
                     </div>
                   ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 border border-dashed rounded-xl border-border/50 text-muted-foreground bg-muted/5">
             <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
             <h3 className="text-lg font-semibold mb-1">No Winnings Yet</h3>
             <p className="text-sm">Keep playing and logging your scores to enroll in the monthly draws!</p>
          </div>
        )}
      </div>
    </div>
  )
}
