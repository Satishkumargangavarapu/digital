import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileWarning, CheckCircle, ExternalLink } from 'lucide-react'
import VerifyActionModal from './VerifyActionModal'

export default async function AdminVerifyPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return redirect('/dashboard')

  // Fetch pending verifications (winnings)
  const { data: winnings, error } = await supabase
    .from('winnings')
    .select(`
      id, match_type, prize_amount, proof_image_url, payout_status, created_at,
      profiles ( email, full_name )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching winnings:', error)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Winner Verification</h1>
        <p className="text-muted-foreground mt-1">Review uploaded scores and approve payouts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Winnings</CardTitle>
          <CardDescription>Review proof for pending payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="py-3 px-4 font-medium">User</th>
                  <th className="py-3 px-4 font-medium">Match Level</th>
                  <th className="py-3 px-4 font-medium">Prize Amount</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Proof File</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winnings?.map((w: any) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                       <div>{w.profiles?.full_name || 'N/A'}</div>
                       <div className="text-xs text-muted-foreground">{w.profiles?.email}</div>
                    </td>
                    <td className="py-3 px-4">{w.match_type} Matches</td>
                    <td className="py-3 px-4 font-medium">${w.prize_amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        w.payout_status === 'approved' || w.payout_status === 'paid' ? 'bg-green-500/10 text-green-500' :
                        w.payout_status === 'pending_review' ? 'bg-yellow-500/10 text-yellow-500' :
                        w.payout_status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {w.payout_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 cursor-pointer">
                      {w.proof_image_url ? (
                        <a href={w.proof_image_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" /> View
                        </a>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1"><FileWarning className="h-4 w-4" /> Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                       <div className="flex justify-end gap-2">
                          <VerifyActionModal winning={w} />
                       </div>
                    </td>
                  </tr>
                ))}
                {(!winnings || winnings.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">No verification requests found.</td>
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
