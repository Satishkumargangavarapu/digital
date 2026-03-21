# Implementation Plan: Adding Missing Features (Razorpay, Lifecycles, Draws, Emails, Verification)

## Goal Description
The objective is to implement the 5 critical missing features identified by the PRD: Subscription lifecycle handling, Real prize pool calculation, Winner verification system, Email notifications, and replacing the Stripe Payment system with Razorpay (supporting PhonePe, UPI, cards).

## User Review Required
> [!IMPORTANT]
> - Replacing Stripe with Razorpay requires wiping out Stripe implementation and migrating completely to Razorpay Subscriptions API.
> - Please approve the use of Resend for emails. You will need a Resend API key in `.env.local`.
> - Please approve the database schema additions below.

## Proposed Changes

### Database Schema Updates (Supabase)
#### [NEW] `supabase/migrations/0001_missing_features.sql`
- Add to `profiles` table: 
  - `razorpay_customer_id TEXT`
  - `razorpay_subscription_id TEXT`
  - `subscription_current_period_end TIMESTAMP WITH TIME ZONE`
  - `subscription_cancel_at_period_end BOOLEAN DEFAULT false`
- Create Storage Bucket `winner-proofs` for users to upload verification images.
- Set up RLS for Storage Bucket so `auth.uid()` can insert, and admins can view.

---

### Payment System Migration & Subscription Lifecycle
#### [DELETE] `src/lib/stripe.ts`
#### [DELETE] `src/app/api/webhooks/stripe/route.ts`
#### [NEW] `src/lib/razorpay.ts`
- Initialize standard Razorpay instance.
#### [NEW] `src/app/api/checkout/razorpay/route.ts`
- Create Razorpay subscription mapped to a plan ID, return standard checkout options.
- Support UPI, PhonePe, Cards via Razorpay Standard Checkout UI.
#### [NEW] `src/app/api/webhooks/razorpay/route.ts`
- Handle `subscription.charged` -> extend `subscription_current_period_end` (Renewal date tracking).
- Handle `subscription.halted` -> set `subscription_status = 'lapsed'` (Auto deactivation).
- Handle `subscription.cancelled` -> set `subscription_cancel_at_period_end = true`.

---

### Real Prize Pool Calculation
#### [MODIFY] `src/app/admin/draws/page.tsx`
- Implement exact PRD calculation in draw logic:
  - 40% -> 5-match (jackpot)
  - 35% -> 4-match
  - 25% -> 3-match
- Divide prize amounts per tier by the number of winners in that tier. Unclaimed 5-match jackpot rolls over to the next month's jackpot.

---

### Winner Verification System
#### [MODIFY] `src/app/dashboard/winnings/page.tsx`
- Add UI to upload proof image if `payout_status = 'pending_proof'`.
- Upload image to Supabase Storage `winner-proofs` bucket and update `winnings.proof_image_url`, setting status to `pending_review`.
#### [MODIFY] `src/app/admin/page.tsx` (or new admin/winnings route)
- Admin UI to view list of `pending_review` winnings.
- Buttons to "Approve" (changes status to `approved`, then conceptually to `paid` when manually disbursed) or "Reject" (changes to `rejected` / `pending_proof`).

---

### Email Notifications
#### [MODIFY] `src/lib/email.ts`
- Configure `resend` instance.
- Add helper `sendDrawResultsEmail(users, drawNumbers)`
- Add helper `sendWinnerAlertEmail(winnerEmail, matchType, amount)`
#### [MODIFY] `src/app/admin/draws/page.tsx`
- When a draw is published, execute `sendDrawResultsEmail` to all active subscribers.
- Execute `sendWinnerAlertEmail` to any users matched in the draw.

## Verification Plan

### Automated Tests
- N/A for these integrations since it requires third-party API keys, but Type checking will ensure data contracts are intact.
- Run `npm run lint` and `npm run build` to verify no TypeScript or build errors.

### Manual Verification
1. **Payments & Lifecycle**: Attempt to checkout. Use Razorpay test mode (UPI/Card). Verify `profiles` table is populated with Razorpay details and `subscription_current_period_end` is valid. Simulate subscription halt in Razorpay dashboard and check if user profile status becomes 'lapsed'.
2. **Prize Pool**: Create a simulated draw. Verify logging or UI shows exactly 40%/35%/25% splits. 
3. **Winner Verification**: Login as user, upload a dummy image to a pending winning. Login as Admin, approve the proof, verify UI updates to "Paid / Approved".
4. **Email**: Trigger a draw, verify Resend dashboard or inbox receives the draw results and winner emails.
