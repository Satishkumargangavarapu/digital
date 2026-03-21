import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return redirect('/dashboard')

  // Fetch Charities
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charities Management</h1>
          <p className="text-muted-foreground mt-1">Manage listed charities and featured status.</p>
        </div>
        <Link href="/admin/charities/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
           <Plus className="h-4 w-4" /> Add Charity
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {charities?.map(charity => (
           <Card key={charity.id} className="flex flex-col">
             {charity.image_url && (
                <div className="w-full h-40 bg-muted overflow-hidden rounded-t-lg">
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
                </div>
             )}
             <CardHeader>
               <CardTitle className="flex justify-between items-start gap-4">
                  <span>{charity.name}</span>
                  {charity.is_featured && <span className="bg-pink-500/10 text-pink-500 px-2 py-1 rounded text-xs">Featured</span>}
               </CardTitle>
             </CardHeader>
             <CardContent className="flex-1">
               <p className="text-sm text-muted-foreground line-clamp-3">{charity.description}</p>
             </CardContent>
             <CardFooter className="pt-4 border-t border-border/50 text-sm text-muted-foreground">
                Raised: ${charity.total_raised}
             </CardFooter>
           </Card>
        ))}
        {(!charities || charities.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border/50 border-dashed">
             No charities added yet.
          </div>
        )}
      </div>
    </div>
  )
}
