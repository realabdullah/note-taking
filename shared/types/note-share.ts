export type NoteShare = {
	url: string;
	createdAt: string;
};

export type PublicNote = {
	title: string;
	content: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
};
