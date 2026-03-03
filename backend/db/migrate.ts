import { MIGRATIONS_DIR } from "../config.ts";
import { drizzle, migrate, postgres } from "../deps.ts";

const databaseUrl = Deno.env.get("DATABASE_URL");
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  Deno.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

try {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  console.log("✅ Migrations applied");
} finally {
  await sql.end({ timeout: 5 });
}
