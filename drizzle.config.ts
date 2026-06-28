import { defineConfig } from "drizzle-kit";

// Used by `drizzle-kit studio` / `pull` for typed DB access. The schema source
// of truth is `supabase/migrations` (see src/db/schema.ts) — do not `push`.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: only read by drizzle-kit CLI
    url: process.env.DATABASE_URL!,
  },
});
