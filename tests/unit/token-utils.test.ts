import { describe, expect, it } from "vitest";
import { generateToken, hashToken, isPersonalAccessToken, tokenPrefix } from "../../server/utils/tokens";

describe("personal access token utilities", () => {
	it("generates a 256-bit base64url token", () => {
		const token = generateToken();
		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
	});

	it("generates a unique token per call", () => {
		expect(generateToken()).not.toBe(generateToken());
	});

	it("hashes a token without exposing the raw value", () => {
		const token = generateToken();
		const hash = hashToken(token);
		expect(hash).not.toBe(token);
		expect(hash).not.toContain(token);
		expect(hashToken(token)).toBe(hash);
	});

	it("derives a short display prefix from the token", () => {
		const token = generateToken();
		const prefix = tokenPrefix(token);
		expect(prefix.length).toBe(8);
		expect(token.startsWith(prefix)).toBe(true);
		expect(prefix.length).toBeLessThan(token.length);
	});

	it("recognizes the token format", () => {
		expect(isPersonalAccessToken("a".repeat(43))).toBe(true);
		expect(isPersonalAccessToken("a".repeat(42))).toBe(false);
		expect(isPersonalAccessToken("not-a-token")).toBe(false);
	});
});
