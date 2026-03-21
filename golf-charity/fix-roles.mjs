import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixRoles() {
  console.log("Demoting all users except the primary admin...");
  
  // First, find the current target admin (either admin@golfcharity.com or satish13@gmail.com)
  const { data: users } = await supabaseAdmin.from('profiles').select('id, email');
  
  const targetAdmin = users.find(u => u.email.includes('satish') || u.email.includes('admin'));
  
  if (targetAdmin) {
    console.log(`Setting ${targetAdmin.email} as the ONLY admin.`);
    
    // Set targetAdmin to true
    await supabaseAdmin.from('profiles').update({ is_admin: true }).eq('id', targetAdmin.id);
    
    // Set all others to false
    await supabaseAdmin.from('profiles').update({ is_admin: false }).neq('id', targetAdmin.id);
    
    console.log("Roles successfully fixed for demo!");
  } else {
    console.log("Could not identify the primary admin user.");
  }
}
fixRoles();
