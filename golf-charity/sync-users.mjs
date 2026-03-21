import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function sync() {
  const { data, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  const users = data?.users;
  if (authErr || !users) return console.error('Auth Error', authErr);

  console.log(`Found ${users.length} users in auth.users.`);
  
  for (const user of users) {
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', user.id).single();
    if (!profile) {
      console.log(`Missing profile for ${user.email}. Creating it now so the DB doesn't silently block updates...`);
      await supabaseAdmin.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Golfer',
        subscription_status: 'none'
      });
      console.log(`Created profile for ${user.email}`);
    } else {
      console.log(`Profile already exists for ${user.email}`);
    }
  }
  console.log("Done syncing users.");
}
sync();
