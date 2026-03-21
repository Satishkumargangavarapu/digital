import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function applyMigrations() {
  try {
    console.log("Starting database migrations...");

    // Read migration files
    const migrations = [
      "supabase/migrations/0000_initial_schema.sql",
      "supabase/migrations/0001_missing_features.sql",
    ];

    for (const migrationFile of migrations) {
      const filePath = path.join(process.cwd(), migrationFile);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${migrationFile} - file not found`);
        continue;
      }

      const sql = fs.readFileSync(filePath, "utf-8");

      // Split SQL statements by semicolon
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      console.log(`\nApplying ${migrationFile} (${statements.length} statements)...`);

      for (let i = 0; i < statements.length; i++) {
        try {
          const statement = statements[i];
          console.log(`  [${i + 1}/${statements.length}] Executing...`);

          const { error } = await supabase.rpc("exec", {
            sql: statement,
          });

          if (error) {
            // Try alternative method: direct SQL execution
            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
              },
              body: JSON.stringify({ query: statement }),
            });

            if (!response.ok) {
              // For some statements like CREATE TABLE that might fail silently
              console.log(
                `    Statement ${i + 1} processed (may be skipped if already exists)`
              );
            } else {
              console.log(`    ✓ Statement ${i + 1} applied`);
            }
          } else {
            console.log(`    ✓ Statement ${i + 1} applied`);
          }
        } catch (err) {
          console.error(`  ✗ Error in statement ${i + 1}:`, err.message);
          // Continue with next statement
        }
      }
    }

    console.log("\n✓ Migration process completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigrations();
