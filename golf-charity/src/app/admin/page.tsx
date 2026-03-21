import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Heart, DollarSign } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeSubs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
  const { count: totalCharities } = await supabase.from('charities').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform overview and general statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 text-primary">{activeSubs || 0} Active Subscribers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prize Pool</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated for next draw</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charity Contributions</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCharities || 0} Listed</div>
            <p className="text-xs text-muted-foreground mt-1">$0.00 Total Raised globally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draw Stats</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Draws Completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
