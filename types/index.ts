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
export type APItype = "server" | "indexeddb";

export type APIConfig = {
	type: APItype;
	serverUrl?: string;
};

export interface NotesAPI {
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	getAllNotes: () => Promise<NoteObj[]>;
	getNoteBySlug: (slug: string) => Promise<NoteObj | null>;
	createNote: (note: NoteObj) => Promise<void>;
	updateNote: (slug: string, updates: NoteObj) => Promise<void>;
	deleteNote: (slug: string) => Promise<void>;
}

export interface SettingsObj {
	user: string;
	colorMode: ColorMode;
	fontFamily: FontFamily;
}

export interface User {
	id: string;
	email: string;
}

export interface Session {
	token: string;
	userId: string;
	expiry: number;
}
