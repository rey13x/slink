import { createClient } from "@libsql/client/web";
import { config as dotconfig } from "dotenv";

dotconfig();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function resetDatabase() {
  console.log("Resetting database...");
  
  // Drop all tables in reverse order of dependencies
  const tablesToDrop = [
    "account",
    "session", 
    "link",
    "userLink",
    "verificationToken",
    "user",
  ];

  for (const table of tablesToDrop) {
    try {
      await client.execute(`DROP TABLE IF EXISTS "${table}"`);
      console.log(`✓ Dropped ${table}`);
    } catch (err) {
      console.log(`  (${table} already dropped or error: ${err.message})`);
    }
  }

  // Now create tables in correct order
  const createTableStatements = [
    `CREATE TABLE "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "email" text NOT NULL,
      "emailVerified" integer,
      "image" text,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL
    )`,

    `CREATE TABLE "userLink" (
      "id" text PRIMARY KEY NOT NULL,
      "userId" text,
      "total_links" integer DEFAULT 0 NOT NULL,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
    )`,

    `CREATE UNIQUE INDEX "userLinks_userId_idx" ON "userLink" ("userId")`,

    `CREATE TABLE "link" (
      "slug" text PRIMARY KEY NOT NULL,
      "userLinkId" text NOT NULL,
      "description" text,
      "url" text NOT NULL,
      "clicks" integer DEFAULT 0 NOT NULL,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      FOREIGN KEY ("userLinkId") REFERENCES "userLink"("id") ON DELETE cascade
    )`,

    `CREATE INDEX "userLinkId_idx" ON "link" ("userLinkId")`,

    `CREATE TABLE "account" (
      "userId" text NOT NULL,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "providerAccountId" text NOT NULL,
      "refresh_token" text,
      "access_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      PRIMARY KEY("provider", "providerAccountId"),
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
    )`,

    `CREATE INDEX "accounts_userId_idx" ON "account" ("userId")`,

    `CREATE TABLE "session" (
      "sessionToken" text PRIMARY KEY NOT NULL,
      "userId" text NOT NULL,
      "expires" integer NOT NULL,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
    )`,

    `CREATE INDEX "sessions_userId_idx" ON "session" ("userId")`,

    `CREATE TABLE "verificationToken" (
      "identifier" text NOT NULL,
      "token" text NOT NULL,
      "expires" integer NOT NULL,
      "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
      PRIMARY KEY("identifier", "token")
    )`,
  ];

  console.log("\nCreating tables...");
  for (const stmt of createTableStatements) {
    try {
      await client.execute(stmt);
      const tableName = stmt.match(/CREATE (?:TABLE|INDEX|UNIQUE INDEX) "?(\w+)"?/)?.[1];
      console.log(`✓ Created ${tableName}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      console.error(`Statement: ${stmt.substring(0, 100)}...`);
    }
  }

  console.log("\n✓ Database reset complete!");
}

resetDatabase().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
