export const useServerStorage = (baseUrl: string): NotesStorage => {
	const getAllNotes = async (): Promise<NoteObj[]> => fetch(`${baseUrl}/notes`).then(response => response.json());

	const getNoteBySlug = async (id: string): Promise<NoteObj | null> => {
		const note = await fetch(`${baseUrl}/notes/${id}`).then(response => response.json());
		return note ?? null;
	};

	const createNote = async (noteInput: NoteObj) => {
		await fetch(`${baseUrl}/notes`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(noteInput),
		});
	};
	const updateNote = async (id: string, updates: NoteObj) => {
		await fetch(`${baseUrl}/notes/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updates),
		});
	};

	const deleteNote = async (id: string) => {
		await fetch(`${baseUrl}/notes/${id}`, {
			method: "DELETE",
		});
	};

	return {
		getAllNotes,
		getNoteBySlug,
		createNote,
		updateNote,
		deleteNote,
	};
};
