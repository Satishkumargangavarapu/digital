-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CHARITIES TABLE
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    upcoming_events JSONB DEFAULT '[]'::jsonb,
    total_raised DECIMAL DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROFILES TABLE (extends auth.users with Stripe columns)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'lapsed', 'cancelled')),
    subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'yearly', NULL)),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    subscription_cancel_at_period_end BOOLEAN DEFAULT false,
    charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_contribution_percentage DECIMAL DEFAULT 10.0,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GOLF SCORES TABLE
CREATE TABLE IF NOT EXISTS public.golf_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date_played DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TRIGGER TO ENFORCE MAX 5 SCORES PER USER
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.golf_scores
    WHERE id IN (
        SELECT id FROM public.golf_scores
        WHERE user_id = NEW.user_id
        ORDER BY date_played DESC, created_at DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_max_scores ON public.golf_scores;
CREATE TRIGGER trigger_enforce_max_scores
AFTER INSERT ON public.golf_scores
FOR EACH ROW
EXECUTE FUNCTION enforce_max_scores();

-- 6. DRAWS TABLE
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
    draw_logic TEXT DEFAULT 'random' CHECK (draw_logic IN ('random', 'algorithmic')),
    draw_numbers INTEGER[] CHECK (array_length(draw_numbers, 1) = 5 OR draw_numbers IS NULL),
    total_prize_pool DECIMAL DEFAULT 0.00,
    jackpot_amount DECIMAL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DRAW ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.draw_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_numbers INTEGER[] NOT NULL CHECK (array_length(entry_numbers, 1) = 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(draw_id, user_id)
);

-- 8. WINNINGS TABLE
CREATE TABLE IF NOT EXISTS public.winnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
    prize_amount DECIMAL NOT NULL,
    proof_image_url TEXT,
    payout_status TEXT DEFAULT 'pending_proof' CHECK (payout_status IN ('pending_proof', 'pending_review', 'approved', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. RLS (Row Level Security) SETUP
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

-- Charities Policies
CREATE POLICY "Charities are visible to everyone" ON public.charities FOR SELECT USING (true);

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Golf Scores Policies
CREATE POLICY "Users can view own scores" ON public.golf_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.golf_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.golf_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.golf_scores FOR DELETE USING (auth.uid() = user_id);

-- Draws Policies
CREATE POLICY "Anyone can view published draws" ON public.draws FOR SELECT USING (status = 'published');

-- Entries Policies
CREATE POLICY "Users can view own entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);

-- Winnings Policies
CREATE POLICY "Users can view own winnings" ON public.winnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own proof" ON public.winnings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (payout_status IN ('pending_proof', 'rejected'));

-- 10. Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Storage Bucket for Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('winner-proofs', 'winner-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view proofs" ON storage.objects FOR SELECT USING (bucket_id = 'winner-proofs');
CREATE POLICY "Authenticated users can upload proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'winner-proofs' AND auth.uid() = owner);
CREATE POLICY "Users can update their own proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'winner-proofs' AND auth.uid() = owner);
