import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Activity } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function CharitySelectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  const { data: charities } = await supabase.from('charities').select('*')

  const updateCharity = async (formData: FormData) => {
    'use server'
    const charityId = formData.get('charity_id') as string
    const percentage = parseFloat(formData.get('percentage') as string)

    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user && charityId) {
       await sb.from('profiles').update({
         charity_id: charityId,
         charity_contribution_percentage: Math.max(10, percentage) // Min 10%
       }).eq('id', user.id)
       revalidatePath('/dashboard/charity')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charity Impact</h1>
        <p className="text-muted-foreground mt-1">Select where your contributions go. A minimum of 10% is automatically donated.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
           <Card className="border-pink-500/30 bg-pink-500/5">
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-pink-500" /> Your Current Selection</CardTitle>
             </CardHeader>
             <CardContent>
               {profile?.charity_id ? (
                 <div className="space-y-4">
                   <div className="text-xl font-bold">{charities?.find(c => c.id === profile.charity_id)?.name}</div>
                   <div className="p-4 rounded-lg bg-background border border-border/50 flex justify-between items-center shadow-sm">
                     <span className="text-muted-foreground font-medium">Contribution Rate</span>
                     <span className="text-3xl font-black text-pink-500">{profile?.charity_contribution_percentage}%</span>
                   </div>
                 </div>
               ) : (
                 <p className="text-muted-foreground bg-background/50 p-4 rounded-md border border-border/50">You have not selected a charity yet. Please select one from the list.</p>
               )}
             </CardContent>
           </Card>
        </div>

        <div>
           <h3 className="text-xl font-bold mb-4">Select or Update</h3>
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
             {charities?.map(charity => (
               <Card key={charity.id} className={profile?.charity_id === charity.id ? "border-primary bg-primary/5" : ""}>
                 <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div>
                      <h4 className="font-bold">{charity.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{charity.description.substring(0, 100)}...</p>
                    </div>
                    {profile?.charity_id !== charity.id && (
                      <form action={updateCharity} className="shrink-0 flex items-center gap-2">
                        <input type="hidden" name="charity_id" value={charity.id} />
                        <input type="hidden" name="percentage" value="10" />
                        <Button size="sm" variant="outline" className="font-semibold">Select</Button>
                      </form>
                    )}
                    {profile?.charity_id === charity.id && (
                      <div className="shrink-0 flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-md text-sm border border-primary/20">
                        <Activity className="h-4 w-4" /> Active
                      </div>
                    )}
                 </CardContent>
               </Card>
             ))}
             {charities?.length === 0 && (
               <p className="text-muted-foreground text-center p-8 border border-dashed rounded-lg">Admin has not added charities yet.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
