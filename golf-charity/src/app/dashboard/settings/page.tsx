import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const updateProfile = async (formData: FormData) => {
    'use server'
    const fullName = formData.get('fullName') as string
    
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user && fullName) {
       await sb.from('profiles').update({
         full_name: fullName,
       }).eq('id', user.id)
       revalidatePath('/dashboard/settings')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and personal preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information used for verification.</CardDescription>
        </CardHeader>
        <CardContent>
           <form action={updateProfile} className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" value={profile?.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Your email address is managed directly by your authentication provider.</p>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium">Full Name (Legal Name)</label>
                <Input type="text" name="fullName" defaultValue={profile?.full_name} required placeholder="John Doe" />
                <p className="text-xs text-muted-foreground">Used for verifying your identity when claiming prizes.</p>
             </div>

             <div className="pt-4 flex justify-end">
                <Button type="submit">Save Changes</Button>
             </div>
           </form>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground mb-4">
              If you wish to delete your account or cancel your active subscription completely, please contact support. Cancelling your subscription will prevent you from participating in future draws.
           </p>
           <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">Cancel Subscription</Button>
        </CardContent>
      </Card>
    </div>
  )
}
