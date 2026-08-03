import { createError } from "h3";
import type { CreateTokenBody } from "~~/shared/schemas/token";
import type { CreatedPersonalAccessToken, PersonalAccessToken } from "~~/shared/types/token";
import { personalAccessTokenRepository } from "../repositories/personal-access-tokens";
import { generateToken, hashToken, isPersonalAccessToken, tokenPrefix } from "../utils/tokens";

export type TokenAuthenticatedUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
};

export const personalAccessTokenService = {
	async create(userId: string, input: CreateTokenBody): Promise<CreatedPersonalAccessToken> {
		const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
		if (expiresAt && expiresAt.getTime() <= Date.now()) {
			throw createError({ statusCode: 400, statusMessage: "Token expiry must be in the future" });
		}

		const token = generateToken();
		const record = await personalAccessTokenRepository.create({
			userId,
			name: input.name,
			tokenHash: hashToken(token),
			tokenPrefix: tokenPrefix(token),
			expiresAt,
		});

		return { token, record };
	},

	async list(userId: string): Promise<PersonalAccessToken[]> {
		return personalAccessTokenRepository.list(userId);
	},

	async revoke(userId: string, tokenId: string): Promise<void> {
		const revoked = await personalAccessTokenRepository.revoke(userId, tokenId);
		if (!revoked) throw createError({ statusCode: 404, statusMessage: "Token not found" });
	},

	async authenticate(rawToken: string): Promise<TokenAuthenticatedUser | null> {
		if (!isPersonalAccessToken(rawToken)) return null;

		const record = await personalAccessTokenRepository.findByHash(hashToken(rawToken));
		if (!record) return null;
		if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) return null;

		await personalAccessTokenRepository.touchLastUsed(record.tokenId);

		return {
			id: record.user.id,
			name: record.user.name,
			email: record.user.email,
			emailVerified: record.user.emailVerified,
			image: record.user.image,
		};
	},
};
