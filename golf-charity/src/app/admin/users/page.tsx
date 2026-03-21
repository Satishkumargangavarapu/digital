import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return redirect('/dashboard')

  // Fetch Users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground mt-1">View and manage platform users and their subscription statuses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{u.full_name || 'N/A'}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.subscription_status === 'active' ? 'bg-green-500/10 text-green-500' :
                        u.subscription_status === 'none' ? 'bg-muted text-muted-foreground' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {u.subscription_status || 'none'}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">{u.subscription_tier || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {u.is_admin ? (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">Admin</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">User</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
