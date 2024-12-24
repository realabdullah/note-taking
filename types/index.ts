export interface NoteObj {
	slug: string;
	title: string;
	content: string;
	tags: string[];
	lastEdited: string | Date;
	isArchived: boolean;
}

export interface ThemeOption {
	title: string;
	desc: string;
	icon: string;
	value: string;
}

export type ColorMode = "light" | "dark" | "system";
export type FontFamily = "sans" | "serif" | "mono";
export type StorageType = "server" | "indexeddb";

export type StorageConfig = {
	type: StorageType;
	serverUrl?: string;
};

export interface NotesStorage {
	getAllNotes: () => Promise<NoteObj[]>;
	getNoteBySlug: (slug: string) => Promise<NoteObj | null>;
	createNote: (note: NoteObj) => Promise<void>;
	updateNote: (slug: string, updates: NoteObj) => Promise<void>;
	deleteNote: (slug: string) => Promise<void>;
}
