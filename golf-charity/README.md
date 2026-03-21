# Golf Charity Subscription Platform

A Next.js web application for a subscription-driven golf performance tracker, combined with a monthly draw engine and charitable donations.

## Features Completed
1. **User Authentication & Profiles**: Supabase-powered custom user records.
2. **Charity Directory**: List of charities users can contribute to securely.
3. **Golf Score Tracking**: Users can input 5 latest stableford scores.
4. **Subscription Management**: Access control via Stripe for platform tiers.
5. **Draw Engine**: Admin capabilities to simulate and publish random or algorithmic draws.
6. **Winner Verification**: Submitting proof of winning, admin approval workflows, and final payouts.
7. **Email Notifications**: Integrated via Resend for draw announcements and verification alerts.

## Getting Started Locally

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

## Test Credentials

### Admin User
- **Email**: admin@golfcharity.test
- **Password**: password123
*Requires database manual switch (`is_admin: true`) if setting up from scratch.*

### Standard Subscriber
- **Email**: user@golfcharity.test
- **Password**: password123

## Environment Variables
Create a `.env.local` based on `.env.example` including:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`

---
*Built with Next.js 14, Tailwind CSS, Supabase, and Stripe.*
