import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });

// Check for DATABASE_URL; if missing, we can't push, but the file is needed.
if (!process.env.DATABASE_URL) {
    // We can't throw here if we want the types to be valid, but CLI will fail if env is missing.
}

export default defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
    },
});
