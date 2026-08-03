import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEvent } from "h3";
import { getCurrentUser, requireSessionUser, requireWriteUser } from "../../server/utils/session";

const tokenService = vi.hoisted(() => ({
	authenticate: vi.fn(),
}));

const authModule = vi.hoisted(() => ({
	api: { getSession: vi.fn() },
}));

vi.mock("../../server/services/personal-access-tokens", () => ({
	personalAccessTokenService: tokenService,
}));

vi.mock("../../server/utils/auth", () => ({
	auth: authModule,
}));

const ada = { id: "user-1", name: "Ada", email: "ada@example.com", emailVerified: true, image: null };

const makeEvent = (headers: Record<string, string> = {}) =>
	createEvent({ headers, method: "GET", url: "/api/notes", socket: {} }, {});

describe("bearer token authentication", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resolves a bearer token to the owning user", async () => {
		tokenService.authenticate.mockResolvedValue(ada);
		const event = makeEvent({ authorization: `Bearer ${"a".repeat(43)}` });

		await expect(getCurrentUser(event)).resolves.toEqual(ada);
		expect(event.context.authMethod).toBe("bearer");
		expect(authModule.api.getSession).not.toHaveBeenCalled();
	});

	it("rejects an expired or revoked bearer token", async () => {
		tokenService.authenticate.mockResolvedValue(null);
		const event = makeEvent({ authorization: `Bearer ${"a".repeat(43)}` });

		await expect(getCurrentUser(event)).resolves.toBeNull();
		expect(authModule.api.getSession).not.toHaveBeenCalled();
	});

	it("falls back to the session when no bearer token is present", async () => {
		authModule.api.getSession.mockResolvedValue({ user: ada });
		const event = makeEvent();

		await expect(getCurrentUser(event)).resolves.toEqual(ada);
		expect(event.context.authMethod).toBe("session");
		expect(tokenService.authenticate).not.toHaveBeenCalled();
	});

	it("rejects bearer-authenticated write access with 403", async () => {
		tokenService.authenticate.mockResolvedValue(ada);
		const event = makeEvent({ authorization: `Bearer ${"a".repeat(43)}` });

		await expect(requireWriteUser(event)).rejects.toMatchObject({ statusCode: 403 });
	});

	it("allows session-authenticated write access", async () => {
		authModule.api.getSession.mockResolvedValue({ user: ada });
		const event = makeEvent();

		await expect(requireWriteUser(event)).resolves.toEqual(ada);
	});

	it("rejects bearer-authenticated session-only routes with 403", async () => {
		tokenService.authenticate.mockResolvedValue(ada);
		const event = makeEvent({ authorization: `Bearer ${"a".repeat(43)}` });

		await expect(requireSessionUser(event)).rejects.toMatchObject({ statusCode: 403 });
	});

	it("requires authentication when nothing is provided", async () => {
		authModule.api.getSession.mockResolvedValue(null);
		const event = makeEvent();

		await expect(requireWriteUser(event)).rejects.toMatchObject({ statusCode: 401 });
	});
});
