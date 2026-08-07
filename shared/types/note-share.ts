export type NoteShare = {
	url: string;
	createdAt: string;
	noteUpdatedAt: string;
	isStale: boolean;
};

export type PublicNote = {
	title: string;
	content: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
};
