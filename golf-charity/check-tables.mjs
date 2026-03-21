import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function checkTables() {
  try {
    console.log("Checking database tables...\n");

    const tables = ["profiles", "charities", "golf_scores", "draws", "draw_entries", "winnings"];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .limit(1);

        if (error && error.code === "PGRST116") {
          console.log(`✗ Table '${table}' does NOT exist (relation not found)`);
        } else if (error) {
          console.log(`? Table '${table}' - Error: ${error.message}`);
        } else {
          console.log(`✓ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`✗ Table '${table}' - Error: ${err.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

checkTables();
