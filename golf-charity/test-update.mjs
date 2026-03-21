import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log("Fetching users...");
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.log("Auth Error:", userError);
    return;
  }
  const user = usersData?.users?.[0];
  if (!user) {
    console.log("No users found");
    return;
  }
  
  console.log("Testing update for user:", user.id);
  const { error } = await supabase.from('profiles').update({
    subscription_status: 'active',
    subscription_tier: 'monthly'
  }).eq('id', user.id);
  
  console.log("Update Error Result:", error);
}
test();
