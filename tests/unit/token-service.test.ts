import { beforeEach, describe, expect, it, vi } from "vitest";
import { personalAccessTokenService } from "../../server/services/personal-access-tokens";
import { hashToken } from "../../server/utils/tokens";

const repository = vi.hoisted(() => ({
	create: vi.fn(),
	list: vi.fn(),
	revoke: vi.fn(),
	findByHash: vi.fn(),
	touchLastUsed: vi.fn(),
}));

vi.mock("../../server/repositories/personal-access-tokens", () => ({
	personalAccessTokenRepository: repository,
}));

const serializedRecord = (overrides: Record<string, unknown> = {}) => ({
	id: "t1",
	name: "CI",
	prefix: "a".repeat(8),
	createdAt: "2026-01-01T00:00:00.000Z",
	lastUsedAt: null,
	expiresAt: null,
	...overrides,
});

describe("personal access token service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the raw token once and stores only its hash", async () => {
		repository.create.mockResolvedValue(serializedRecord());

		const result = await personalAccessTokenService.create("user-1", { name: "CI" });

		expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(result.record.id).toBe("t1");

		const [created] = repository.create.mock.calls[0];
		expect(created.name).toBe("CI");
		expect(created.userId).toBe("user-1");
		expect(created.tokenPrefix).toBe(result.token.slice(0, 8));
		expect(created.tokenHash).toBe(hashToken(result.token));
		expect(created.tokenHash).not.toBe(result.token);
		expect(created.expiresAt).toBeNull();
	});

	it("stores the requested expiry as a timestamp", async () => {
		const expiry = "2030-01-01T00:00:00.000Z";
		repository.create.mockResolvedValue(serializedRecord({ expiresAt: expiry }));

		await personalAccessTokenService.create("user-1", { name: "CI", expiresAt: expiry });

		const [created] = repository.create.mock.calls[0];
		expect(created.expiresAt).toBeInstanceOf(Date);
		expect(created.expiresAt.toISOString()).toBe(expiry);
	});

	it("rejects an expiry in the past", async () => {
		await expect(
			personalAccessTokenService.create("user-1", { name: "CI", expiresAt: "2000-01-01T00:00:00.000Z" })
		).rejects.toMatchObject({ statusCode: 400 });
		expect(repository.create).not.toHaveBeenCalled();
	});

	it("lists the user's tokens", async () => {
		repository.list.mockResolvedValue([]);

		await expect(personalAccessTokenService.list("user-1")).resolves.toEqual([]);
		expect(repository.list).toHaveBeenCalledWith("user-1");
	});

	it("revokes a token owned by the user", async () => {
		repository.revoke.mockResolvedValue(true);

		await expect(personalAccessTokenService.revoke("user-1", "t1")).resolves.toBeUndefined();
		expect(repository.revoke).toHaveBeenCalledWith("user-1", "t1");
	});

	it("throws when revoking an unknown or foreign token", async () => {
		repository.revoke.mockResolvedValue(false);

		await expect(personalAccessTokenService.revoke("user-1", "t1")).rejects.toMatchObject({ statusCode: 404 });
	});

	it("resolves a valid token to the owning user", async () => {
		repository.findByHash.mockResolvedValue({
			tokenId: "t1",
			userId: "user-1",
			expiresAt: null,
			user: { id: "user-1", name: "Ada", email: "ada@example.com", emailVerified: true, image: null },
		});

		const user = await personalAccessTokenService.authenticate("a".repeat(43));

		expect(user).toEqual({
			id: "user-1",
			name: "Ada",
			email: "ada@example.com",
			emailVerified: true,
			image: null,
		});
		expect(repository.findByHash).toHaveBeenCalledWith(hashToken("a".repeat(43)));
		expect(repository.touchLastUsed).toHaveBeenCalledWith("t1");
	});

	it("rejects an expired token", async () => {
		repository.findByHash.mockResolvedValue({
			tokenId: "t1",
			userId: "user-1",
			expiresAt: new Date(Date.now() - 60_000),
			user: { id: "user-1", name: "Ada", email: "ada@example.com", emailVerified: true, image: null },
		});

		await expect(personalAccessTokenService.authenticate("a".repeat(43))).resolves.toBeNull();
		expect(repository.touchLastUsed).not.toHaveBeenCalled();
	});

	it("rejects a revoked or unknown token", async () => {
		repository.findByHash.mockResolvedValue(null);

		await expect(personalAccessTokenService.authenticate("a".repeat(43))).resolves.toBeNull();
		expect(repository.touchLastUsed).not.toHaveBeenCalled();
	});

	it("ignores malformed tokens without a lookup", async () => {
		await expect(personalAccessTokenService.authenticate("short")).resolves.toBeNull();
		expect(repository.findByHash).not.toHaveBeenCalled();
	});
});
