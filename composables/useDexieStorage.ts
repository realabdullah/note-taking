export const useDexieStorage = (): NotesStorage => {
	const getAllNotes = async (): Promise<NoteObj[]> => db.notes.toArray();

	const getNoteBySlug = async (id: string): Promise<NoteObj | null> => {
		const note = await db.notes.get(id);
		return note ?? null;
	};

	const createNote = async (noteInput: NoteObj): Promise<void> => {
		try {
			await db.notes.add(serialize(noteInput));
		} catch (error) {
			console.log("error => ", error);
		}
	};

	const updateNote = async (slug: string, updates: NoteObj): Promise<void> => {
		try {
			await db.notes.update(slug, { ...serialize(updates) });
		} catch (error) {
			console.log("error => ", error);
		}
	};

	const deleteNote = async (slug: string): Promise<void> => {
		try {
			await db.notes.delete(slug);
		} catch (error) {
			console.log("error => ", error);
		}
	};

	return {
		getAllNotes,
		getNoteBySlug,
		createNote,
		updateNote,
		deleteNote,
	};
};
