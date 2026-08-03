import { z } from "zod";

export const tokenIdSchema = z.uuid();

export const createTokenSchema = z.object({
	name: z.string().trim().min(1).max(60),
	expiresAt: z.iso.datetime().optional(),
});

export type CreateTokenBody = z.infer<typeof createTokenSchema>;
