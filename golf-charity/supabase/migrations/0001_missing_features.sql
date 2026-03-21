-- 0001_missing_features.sql

-- Add new columns for Razorpay and Subscription Lifecycle to profiles
ALTER TABLE public.profiles 
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Create Storage bucket for winner proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', true);

-- Enable RLS for the storage bucket
-- (Note: Storage policies are attached to storage.objects)
CREATE POLICY "Anyone can view proofs" ON storage.objects FOR SELECT USING (bucket_id = 'winner-proofs');
CREATE POLICY "Authenticated users can upload proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'winner-proofs' AND auth.uid() = owner);
CREATE POLICY "Users can update their own proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'winner-proofs' AND auth.uid() = owner);
