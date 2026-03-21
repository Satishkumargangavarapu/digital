import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { planId, isYearly } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    let stripeCustomerId = profile?.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.full_name || user.email!,
      })
      stripeCustomerId = customer.id
      
      // await supabase.from('profiles').update({ stripe_customer_id: customer.id }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscribe?canceled=true`,
      metadata: {
        supabaseUUID: user.id,
        tier: isYearly ? 'yearly' : 'monthly',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Checkout error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
