import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("NotesDB") as Dexie & {
	notes: EntityTable<NoteObj, "slug">;
};

db.version(1).stores({
	notes: "slug, title, content, tags, lastEdited, isArchived",
});

export { db };
