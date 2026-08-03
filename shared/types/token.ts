export type PersonalAccessToken = {
	id: string;
	name: string;
	prefix: string;
	createdAt: string;
	lastUsedAt: string | null;
	expiresAt: string | null;
};

export type CreatedPersonalAccessToken = {
	token: string;
	record: PersonalAccessToken;
};
