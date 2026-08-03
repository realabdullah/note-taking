import { defineConfig } from "drizzle-kit"

try {
  process.loadEnvFile()
} catch {
  // .env is optional; fall back to the local default connection string below
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL ?? "postgresql://fieldnote:fieldnote@127.0.0.1:5432/fieldnote",
  },
  strict: true,
  verbose: true,
})
