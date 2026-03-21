import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function makeAdmins() {
  console.log("Upgrading physical profile roles to Admin...");
  const { error } = await supabaseAdmin.from('profiles').update({ is_admin: true }).neq('email', 'fake');
  if (error) console.error(error);
  else console.log("All legacy user profiles are now granted Admin access!");
}
makeAdmins();
