import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString =
  process.env.NUXT_DATABASE_URL ?? "postgresql://fieldnote:fieldnote@127.0.0.1:5432/fieldnote"

const sql = neon(connectionString)

export const db = drizzle(sql, { schema })
