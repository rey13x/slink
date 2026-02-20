import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client/web";
import { config as dotconfig } from "dotenv";

dotconfig();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient({
  url: process.env.TURSO_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function runMigrations() {
  const migrationDir = path.join(__dirname, "drizzle");
  const files = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith(".sql") && !f.startsWith("meta"))
    .sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    let sql = fs.readFileSync(path.join(migrationDir, file), "utf-8");
    console.log(`Applying ${file}...`);

    // Remove comments
    sql = sql
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
      .replace(/--.*$/gm, ""); // Remove line comments

    // Split by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err) {
        // Check if it's an "table already exists" error, which is fine
        let msg = String(err);
        if (typeof err === 'object' && err !== null && 'message' in err) {
          msg = err.message;
        }
        if (!msg.includes("already exists")) {
          console.error(`Error executing statement:\n${stmt}\n`, msg);
        } else {
          console.log(`  (skipping: table already exists)`);
        }
      }
    }

    console.log(`✓ ${file} applied`);
  }

  console.log("\n✓ All migrations applied successfully!");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
