import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function blast() {
  await supabaseAdmin.from('profiles').update({ is_admin: true }).neq('email', 'nobody');
  console.log("Made absolutely everyone an admin!");
}
blast();
