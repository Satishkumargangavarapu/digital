import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  await supabaseAdmin.from('profiles').update({ is_admin: true }).like('email', '%satish13%');
  console.log("Restored Admin for Satish!");
}
fix();
