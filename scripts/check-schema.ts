import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables:", result.rows);

  client.close();
}

main().catch(console.error);
