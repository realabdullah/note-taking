import { and, desc, eq } from "drizzle-orm";
import type { PersonalAccessToken } from "~~/shared/types/token";
import { db } from "../database/client";
import { personalAccessTokens, user } from "../database/schema";

const serialize = (row: typeof personalAccessTokens.$inferSelect): PersonalAccessToken => ({
	id: row.id,
	name: row.name,
	prefix: row.tokenPrefix,
	createdAt: row.createdAt.toISOString(),
	lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
	expiresAt: row.expiresAt?.toISOString() ?? null,
});

export type TokenOwnerRecord = {
	tokenId: string;
	userId: string;
	expiresAt: Date | null;
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
	};
};

export const personalAccessTokenRepository = {
	async create(input: {
		userId: string;
		name: string;
		tokenHash: string;
		tokenPrefix: string;
		expiresAt: Date | null;
	}): Promise<PersonalAccessToken> {
		const [row] = await db.insert(personalAccessTokens).values(input).returning();
		if (!row) throw new Error("Unable to create personal access token");
		return serialize(row);
	},

	async list(userId: string): Promise<PersonalAccessToken[]> {
		const rows = await db
			.select()
			.from(personalAccessTokens)
			.where(eq(personalAccessTokens.userId, userId))
			.orderBy(desc(personalAccessTokens.createdAt));

		return rows.map(serialize);
	},

	async revoke(userId: string, tokenId: string): Promise<boolean> {
		const [deleted] = await db
			.delete(personalAccessTokens)
			.where(and(eq(personalAccessTokens.id, tokenId), eq(personalAccessTokens.userId, userId)))
			.returning({ id: personalAccessTokens.id });

		return Boolean(deleted);
	},

	async findByHash(tokenHash: string): Promise<TokenOwnerRecord | null> {
		const [row] = await db
			.select({
				tokenId: personalAccessTokens.id,
				userId: personalAccessTokens.userId,
				expiresAt: personalAccessTokens.expiresAt,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
				},
			})
			.from(personalAccessTokens)
			.innerJoin(user, eq(personalAccessTokens.userId, user.id))
			.where(eq(personalAccessTokens.tokenHash, tokenHash))
			.limit(1);

		return row ?? null;
	},

	async touchLastUsed(tokenId: string): Promise<void> {
		await db
			.update(personalAccessTokens)
			.set({ lastUsedAt: new Date() })
			.where(eq(personalAccessTokens.id, tokenId));
	},
};
