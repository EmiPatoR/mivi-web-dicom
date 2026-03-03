import process from "node:process";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for Drizzle migrations.");
}

export default defineConfig({
  schema: "./backend/db/schema.ts",
  out: "./backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString,
  },
});
