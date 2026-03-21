import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const getEnv = (key) => {
  const line = envLines.find(l => l.startsWith(`${key}=`));
  return line ? line.split('=')[1].trim() : null;
};

const secretKey = getEnv('STRIPE_SECRET_KEY');

if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});

async function setupStripe() {
  console.log("Setting up Stripe Products and Prices...");

  try {
    // 1. Create Monthly Product & Price
    const monthlyProduct = await stripe.products.create({
      name: 'Monthly Swing',
      description: 'Track up to 5 rolling scores, enter monthly reward draws, 10% auto-donated to charity',
    });
    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 1900, // $19.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`Created Monthly Price: ${monthlyPrice.id}`);

    // 2. Create Yearly Product & Price
    const yearlyProduct = await stripe.products.create({
      name: 'Annual Pro',
      description: 'Track up to 5 rolling scores, enter monthly reward draws, 10% auto-donated to charity, premium badge',
    });
    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 19000, // $190.00
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log(`Created Yearly Price: ${yearlyPrice.id}`);

    // Update .env.local
    const monthlyKey = 'NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID';
    const yearlyKey = 'NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID';

    let newEnvContent = envContent;
    
    if (newEnvContent.includes(monthlyKey)) {
      newEnvContent = newEnvContent.replace(new RegExp(`${monthlyKey}=.*`), `${monthlyKey}=${monthlyPrice.id}`);
    } else {
      newEnvContent += `\n${monthlyKey}=${monthlyPrice.id}`;
    }

    if (newEnvContent.includes(yearlyKey)) {
      newEnvContent = newEnvContent.replace(new RegExp(`${yearlyKey}=.*`), `${yearlyKey}=${yearlyPrice.id}`);
    } else {
      newEnvContent += `\n${yearlyKey}=${yearlyPrice.id}`;
    }

    fs.writeFileSync(envPath, newEnvContent);
    console.log("✅ .env.local has been updated with real Stripe Price IDs.");
    
  } catch (err) {
    console.error("Failed to setup Stripe:", err);
  }
}

setupStripe();
