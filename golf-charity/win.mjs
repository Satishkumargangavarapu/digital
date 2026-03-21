import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function forceWin() {
  const { data: draws } = await supabaseAdmin.from('draws').select('*').order('created_at', { ascending: false }).limit(1);
  if (!draws || draws.length === 0) return console.log("No draws yet.");
  const draw = draws[0];

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email');
  
  console.log("Removing any empty records...");
  await supabaseAdmin.from('winnings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  for (const p of profiles) {
    console.log(`Granting winnings to ${p.email}`);
    
    // 1 payout paid
    await supabaseAdmin.from('winnings').insert({
      draw_id: draw.id,
      user_id: p.id,
      match_type: 5,
      prize_amount: 15400.00,
      payout_status: 'paid'
    });
    
    // 1 payout pending
    await supabaseAdmin.from('winnings').insert({
      draw_id: draw.id,
      user_id: p.id,
      match_type: 4,
      prize_amount: 2500.00,
      payout_status: 'pending_proof'
    });
  }
  console.log("Injected Winnings Successfully!");
}
forceWin();
