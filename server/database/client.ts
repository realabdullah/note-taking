import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString =
  process.env.NUXT_DATABASE_URL ?? "postgresql://fieldnote:fieldnote@127.0.0.1:5432/fieldnote"

const RETRY_ATTEMPTS = 2
const RETRY_DELAY_MS = 1_000

const isTransientNetworkError = (error: unknown) => {
  if (!(error instanceof Error)) return false
  if (error.message.includes("Error connecting to database")) return true

  const cause = error.cause
  return (
    cause instanceof Error &&
    /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EPIPE/.test(cause.message)
  )
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const withRetry = async <T>(run: () => Promise<T>) => {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      if (attempt === RETRY_ATTEMPTS || !isTransientNetworkError(error)) throw error
      await sleep(RETRY_DELAY_MS * (attempt + 1))
    }
  }

  throw lastError
}

const sql = neon(connectionString)

const retryingSql = new Proxy(sql, {
  apply: (target, thisArg, args) => Reflect.apply(target, thisArg, args),
  get: (target, property, receiver) => {
    const client = target as unknown as {
      query: (query: string, params: unknown[], options?: Record<string, unknown>) => Promise<unknown>
      transaction: (queries: unknown[], options?: Record<string, unknown>) => Promise<unknown>
    }

    if (property === "query") {
      return (query: string, params: unknown[], options?: Record<string, unknown>) =>
        withRetry(() => client.query(query, params, options))
    }

    if (property === "transaction") {
      return (queries: unknown[], options?: Record<string, unknown>) =>
        withRetry(() => client.transaction(queries, options))
    }

    return Reflect.get(target, property, receiver)
  },
})

export const db = drizzle(retryingSql, { schema })
