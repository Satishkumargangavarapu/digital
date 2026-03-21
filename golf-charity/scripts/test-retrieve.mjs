import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  try {
    const session = await stripe.checkout.sessions.retrieve('cs_test_a1XDWiOIgNfsoyYqSr5PtAe5cc9E1kqaEymNGU0JpXLaCnm8TUAK6HUPiJ');
    console.log("PAYMENT STATUS:", session.payment_status);
    console.log("STATUS:", session.status);
    console.log("METADATA:", session.metadata);
    console.log("SUBSCRIPTION:", session.subscription);
    console.log("CUSTOMER:", session.customer);
  } catch (err) {
    console.error("Error retrieving session:", err);
  }
}

run();
