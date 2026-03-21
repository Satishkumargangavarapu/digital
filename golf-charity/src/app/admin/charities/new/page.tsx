import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function NewCharityPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return redirect('/dashboard')

  async function createCharity(formData: FormData) {
    'use server'
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const isFeatured = formData.get('isFeatured') === 'on'

    await supabaseAdmin.from('charities').insert({
      name,
      description,
      image_url: imageUrl,
      is_featured: isFeatured
    })

    revalidatePath('/admin/charities')
    revalidatePath('/charities')
    redirect('/admin/charities')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Charity</h1>
        <p className="text-muted-foreground mt-1">Register a new charity on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charity Details</CardTitle>
          <CardDescription>Enter the information for the new charitable organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCharity} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input type="text" id="name" name="name" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" name="description" required rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
              <input type="url" id="imageUrl" name="imageUrl" placeholder="https://..." className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isFeatured" name="isFeatured" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="isFeatured" className="text-sm font-medium">Featured Charity</label>
            </div>

            <div className="pt-6 flex justify-end gap-4">
               <a href="/admin/charities" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                 Cancel
               </a>
               <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                 Save Charity
               </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
