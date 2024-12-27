export interface NoteObj {
	id: string;
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

export type NotePlaygroundActions = "save" | "cancel" | "archive" | "delete" | "unarchive";
export type ColorMode = "light" | "dark" | "system";
export type FontFamily = "sans" | "serif" | "mono";
export type APItype = "server" | "indexeddb" | "appwrite";

export type APIConfig = {
	type: APItype;
	serverUrl?: string;
};

export interface NotesAPI {
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	getAllNotes: (archived: boolean) => Promise<NoteObj[]>;
	getNoteByID: (id: string) => Promise<NoteObj | null>;
	createNote: (note: NoteObj) => Promise<NoteObj | undefined>;
	updateNote: (id: string, updates: NoteObj) => Promise<void>;
	deleteNote: (id: string) => Promise<void>;
	getAccountPrefs: () => Promise<SettingsObj | undefined>;
	setAccountPrefs: (settings: Record<string, string>) => Promise<SettingsObj | undefined>;
	updatePassword: (newPassword: string, oldPassword: string) => Promise<void>;
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
