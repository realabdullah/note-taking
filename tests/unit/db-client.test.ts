import { beforeEach, describe, expect, it, vi } from "vitest"
import { db } from "../../server/database/client"

const neonQuery = vi.hoisted(() => vi.fn())

vi.mock("@neondatabase/serverless", () => ({
	neon: () => Object.assign(neonQuery, { query: neonQuery }),
}))

vi.mock("drizzle-orm/neon-http", () => ({
	drizzle: (client: unknown) => ({ client, __db: true }),
}))

const client = (db as { client: { query: (...args: unknown[]) => Promise<unknown> } }).client

describe("database client resilience", () => {
	beforeEach(() => {
		neonQuery.mockClear()
	})

	it("builds a drizzle client through the retrying proxy", () => {
		expect(client).toBeTypeOf("function")
		expect(client.query).toBeTypeOf("function")
	})

	it("retries a transient network failure and succeeds", async () => {
		neonQuery.mockRejectedValueOnce(new Error("Error connecting to database: TypeError: fetch failed"))
		neonQuery.mockResolvedValueOnce({ rows: [{ ok: 1 }] })

		await expect(client.query("SELECT 1", [], { fullResults: true })).resolves.toEqual({ rows: [{ ok: 1 }] })

		expect(neonQuery).toHaveBeenCalledTimes(2)
	})

	it("gives up after the retry budget for a persistent failure", async () => {
		neonQuery.mockRejectedValue(new Error("Error connecting to database: TypeError: fetch failed"))

		await expect(client.query("SELECT 1", [], { fullResults: true })).rejects.toThrow()

		expect(neonQuery).toHaveBeenCalledTimes(3)
	})

	it("does not retry non-transient errors", async () => {
		neonQuery.mockRejectedValueOnce(new Error('relation "notes" does not exist'))
		neonQuery.mockResolvedValueOnce({ rows: [] })

		await expect(client.query("SELECT 1", [], { fullResults: true })).rejects.toThrow()

		expect(neonQuery).toHaveBeenCalledTimes(1)
	})
})
