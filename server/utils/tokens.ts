import { createHash, randomBytes } from "node:crypto";

const TOKEN_LENGTH = 32;
const TOKEN_PREFIX_LENGTH = 8;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const generateToken = () => randomBytes(TOKEN_LENGTH).toString("base64url");

export const hashToken = (token: string) => createHash("sha256").update(token).digest("base64url");

export const tokenPrefix = (token: string) => token.slice(0, TOKEN_PREFIX_LENGTH);

export const isPersonalAccessToken = (token: string) => TOKEN_PATTERN.test(token);
