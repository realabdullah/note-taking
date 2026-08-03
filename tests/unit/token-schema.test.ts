import { describe, expect, it } from "vitest";
import { createTokenSchema } from "../../shared/schemas/token";

describe("token API schemas", () => {
	it("accepts a name and an optional expiry", () => {
		expect(createTokenSchema.parse({ name: "Personal OS" })).toEqual({ name: "Personal OS" });
		expect(createTokenSchema.parse({ name: "CI", expiresAt: "2030-01-01T00:00:00.000Z" })).toEqual({
			name: "CI",
			expiresAt: "2030-01-01T00:00:00.000Z",
		});
	});

	it("trims whitespace around the name", () => {
		expect(createTokenSchema.parse({ name: "  laptop  " }).name).toBe("laptop");
	});

	it("rejects blank or oversized names", () => {
		expect(() => createTokenSchema.parse({ name: "   " })).toThrow();
		expect(() => createTokenSchema.parse({ name: "x".repeat(61) })).toThrow();
	});

	it("rejects malformed expiry timestamps", () => {
		expect(() => createTokenSchema.parse({ name: "CI", expiresAt: "tomorrow" })).toThrow();
	});
});
