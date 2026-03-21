import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') as string

    if (!signature) {
      return new NextResponse('Missing signature', { status: 400 })
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'inactive';
      
      const { error } = await supabaseAdmin.from('profiles').update({
        subscription_status: status,
        subscription_current_period_end: currentPeriodEnd,
        stripe_subscription_id: subscription.id
      }).eq('stripe_customer_id', subscription.customer);
      if (error) console.error('Webhook DB Update Error:', error)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const { error } = await supabaseAdmin.from('profiles').update({
        subscription_status: 'lapsed',
        subscription_cancel_at_period_end: true
      }).eq('stripe_subscription_id', subscription.id);
      if (error) console.error('Webhook DB Delete Error:', error)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe Webhook Error:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
}
