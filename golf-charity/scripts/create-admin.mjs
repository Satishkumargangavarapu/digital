import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdmin() {
  const email = process.argv[2] || 'admin@golfcharity.com';
  const password = process.argv[3] || 'AdminUser2026!';

  console.log(`Attempting to create admin: ${email}...`);

  try {
    // 1. Create or get user
    const { data: userResp, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'System Admin' }
    });

    let userId;

    if (userError) {
      if (userError.message.includes('already registered')) {
        console.log("User already exists, seeking their ID...");
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = existingUsers.users.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          throw new Error("Could not find existing user ID.");
        }
      } else {
        throw userError;
      }
    } else {
      userId = userResp.user.id;
    }

    // 2. Wait a moment for trigger to create profile (handle_new_user)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Set is_admin = true
    const { error: updateError } = await supabase.from('profiles').update({ is_admin: true }).eq('id', userId);
    
    if (updateError) throw updateError;

    console.log(`\n✅ Successfully configured administrator account!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nYou can now log in at /admin or the main login page.\n`);

  } catch (err) {
    console.error("Failed to create admin:", err);
  }
}

createAdmin();
