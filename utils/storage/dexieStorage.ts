import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("NotesDB") as Dexie & {
	users: EntityTable<User & { password: string }, "id">;
	sessions: EntityTable<Session, "userId">;
	notes: EntityTable<NoteObj, "id">;
	settings: EntityTable<SettingsObj, "user">;
	securityQuestions: EntityTable<SecurityQuestion, "userId">;
};

db.version(1).stores({
	users: "id, email, password",
	notes: "id, slug, title, content, tags, lastEdited, isArchived, userId",
	settings: "user, colorMode, fontFamily, userId",
	sessions: "token, userId, expiry",
	securityQuestions: "userId, questions, answers",
});

export { db };
