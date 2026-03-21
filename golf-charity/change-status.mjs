import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function advance() {
  await supabaseAdmin.from('winnings').update({ payout_status: 'pending_review' }).eq('payout_status', 'pending_proof');
  console.log("Advanced all pending proofs to pending review!");
}
advance();
