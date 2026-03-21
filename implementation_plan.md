# Implementation Plan: Golf Charity Subscription Platform

## Goal Description
Build a subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. The app will feature a custom, emotion-driven design that avoids traditional golf cliches, focusing on charitable impact and modern aesthetics.

## Proposed Architecture
- **Framework**: Next.js (React) with App Router for SSR/CSR balancing and API routes.
- **Styling**: Tailwind CSS (with custom configuration for a modern, glassmorphism, and bold aesthetic, deviating from standard "golf" greens). Framer Motion for micro-interactions and animations.
- **Database Backend**: Supabase (PostgreSQL, Authentication, Row Level Security, Storage).
- **Payment Gateway**: Stripe (Subscriptions, Webhooks).
- **Email Provider**: Resend or SendGrid for system updates, draw results, and winner alerts.
- **Hosting**: Vercel (Deployed to a new account).

## Database Schema (Supabase)
### `users` (Managed via Supabase Auth + `profiles` table)
- `id` (UUID, primary key)
- `email` (string)
- `full_name` (string)
- `subscription_status` (enum: 'none', 'active', 'lapsed', 'cancelled')
- `subscription_tier` (enum: 'monthly', 'yearly')
- `stripe_customer_id` (string)
- `stripe_subscription_id` (string)
- `charity_id` (UUID, foreign key)
- `charity_contribution_percentage` (decimal, default 10.0)
- `is_admin` (boolean, default false)

### `golf_scores`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `score` (integer, 1-45)
- `date_played` (date)
- `created_at` (timestamp)
*Logic: Database trigger maintains only the latest 5 scores per user. Displayed in reverse chronological order.*

### `charities`
- `id` (UUID, primary key)
- `name` (string)
- `description` (text)
- `image_url` (string)
- `upcoming_events` (jsonb)
- `total_raised` (decimal)
- `is_featured` (boolean, default false)

### `draws`
- `id` (UUID, primary key)
- `month` (date/string)
- `status` (enum: 'pending', 'simulated', 'published')
- `draw_numbers` (integer array of length 5, 1-45)
- `total_prize_pool` (decimal)
- `jackpot_amount` (decimal)
- `draw_logic` (enum: 'random', 'algorithmic')

### `draw_entries`
- `id` (UUID, primary key)
- `draw_id` (UUID, foreign key)
- `user_id` (UUID, foreign key)
- `entry_numbers` (integer array of length 5)

### `winnings` (Winner Verification)
- `id` (UUID, primary key)
- `draw_id` (UUID, foreign key)
- `user_id` (UUID, foreign key)
- `match_type` (integer: 3, 4, or 5)
- `prize_amount` (decimal)
- `proof_image_url` (string, nullable)
- `payout_status` (enum: 'pending_proof', 'pending_review', 'approved', 'paid', 'rejected')

## Proposed Changes / Steps

### Step 1: Project Initialization & Architecture Setup
- Initialize Next.js project on Vercel.
- Set up Supabase project, define schema, triggers, and Row Level Security.
- Structure codebase for scalability (multi-country, future mobile app API).

### Step 2: UI/UX Foundation & Public Pages
- Implement non-traditional golf layout (motion-enhanced, emotional).
- Public Homepage: Clear CTA, what to do, how to win, charity impact, and featured charity.
- Charity Directory: Search, filter, and individual profiles with upcoming golf days.

### Step 3: Authentication & Subscription Engine
- Implement Signup/Login (Supabase Auth).
- Restrict non-subscribers from platform features.
- Set up Stripe Monthly/Yearly plans.
- Sync subscription lifecycle (renewal/cancellation statuses) with real-time validation.

### Step 4: User Dashboard & Core Features
- Dashboard Modules: Subscription status, Charity & Contribution % (min 10%, plus independent donations), Participation summary, and Winnings overview.
- Score Management: Enter & edit interface. Validate 1-45 over 5 entries. Reverse chronological order.

### Step 5: Draw Engine & Prize Pool
- Admin Draw Setup: Config for Random vs Algorithmic generation.
- Calculation: Sub pool % split (40% 5-match jackpot, 35% 4-match, 25% 3-match).
- Auto-calculate multiple winners and carry forward 5-match jackpot if unclaimed.
- Run monthly draw simulations before publishing.

### Step 6: Winner Verification & Email Notifications
- System automation: Emails for draw results and winner alerts.
- User flow: Upload score screenshot as proof if winner. Admin reviews and updates payout to Paid.

### Step 7: Admin Control
- Manage Users (edit profiles, scores, subscriptions).
- Manage Charities (add/delete content, upcoming events).
- Reports (Total users, prize pool, charity totals, stats).

## Verification Plan
### Automated & Logic Tests
- Integration tests checking 5-match jackpot rollover and multi-winner fractional payouts.
- Validate Score DB triggers strictly restrict to 5 latest scores.
- Test routing middleware to ensure non-subscribers are properly restricted.

### Manual Verification Checklist
- Full signup and test card Stripe subscription (Monthly/Yearly).
- Dashboard data accuracy for active subscriber.
- Run Admin draw simulation with test entries. Publish results.
- Verify Search, Filter, and Featured tags on Charities page.
- End-to-end Winner Proof upload -> Admin Approval -> Payout Status change.
- Verify mobile responsiveness everywhere.
- Generate and provide User Credentials and Admin Credentials.
- Confirm final Live Vercel URL accessibility.
