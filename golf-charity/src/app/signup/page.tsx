import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Target } from 'lucide-react'

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
       return redirect(`/signup?message=${error.message}`)
    }

    return redirect(`/login?message=Check your email to continue sign in process`)
  }

  return (
    <div className="flex-1 flex w-full px-8 sm:max-w-md justify-center items-center h-screen mx-auto relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
      
      <Card className="w-full relative z-10 border-border/50 bg-background/60">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto bg-accent/10 p-3 rounded-full mb-2 border border-accent/20 hover:bg-accent/20 transition-colors">
            <Target className="h-6 w-6 text-accent" />
          </Link>
          <CardTitle className="text-2xl font-bold">Join the Movement</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Track scores, win huge payouts, give back.</p>
        </CardHeader>
        <CardContent>
          <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground" action={signUp}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="full_name">
                Full Name
              </label>
              <Input
                name="full_name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="email">
                Email
              </label>
              <Input
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="password">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button className="w-full mt-4 font-semibold hover:bg-accent hover:text-white border-accent text-accent border transition-colors bg-transparent">Sign Up</Button>
            
            {searchParams?.message && (
              <p className="text-sm mt-4 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-center">
                {searchParams.message}
              </p>
            )}
            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link href="/login" className="text-accent hover:underline font-medium">Log in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
