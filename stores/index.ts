import type { NoteObj } from "~/types";
import { notesData } from "@/assets/constants";

export const useStore = defineStore("store", () => {
	const route = useRoute();
	const activeNote = ref<NoteObj>({
		slug: "",
		title: "",
		content: "",
		tags: [],
		lastEdited: new Date(),
		isArchived: false,
	});
	const notes = ref<NoteObj[]>([...notesData]);
	const isNewNote = computed(() => activeNote.value.slug.includes("new-note-"));

	const updateActiveNote = (note: NoteObj) => {
		activeNote.value = { ...note };
	};

	const updateNote = (note: NoteObj) => {
		notes.value = notes.value.map(({ slug, ...rest }) => {
			if (slug === note.slug) {
				return { ...note };
			}
			return { slug, ...rest };
		});
	};

	const saveNote = () => {
		if (isNewNote.value) {
			activeNote.value.slug = slugify(activeNote.value.title);
			notes.value.splice(0, 0, activeNote.value);
            navigateTo({ name: "note", query: route.query, params: { slug: activeNote.value.slug } });
			return;
		}

        const note = notes.value.find(note => note.slug === activeNote.value.slug);
        if (note && JSON.stringify(note) === JSON.stringify(activeNote.value)) {
            return;
        }

		activeNote.value.lastEdited = new Date();
		updateNote(activeNote.value);
	};

	const cancelChanges = () => {
		const note = notes.value.find(note => note.slug === activeNote.value.slug);
		if (note) {
			updateActiveNote(note);
			updateNote(note);
		}
	};

	const archiveNote = () => {
		const note = notes.value.find(note => note.slug === activeNote.value.slug);
		if (note) {
			note.isArchived = true;
			updateNote(note);
			updateActiveNote(note);
			navigateTo({ name: "archived-note", query: route.query, params: { slug: activeNote.value.slug } });
		}
	};

	const deleteNote = () => {
		const note = notes.value.find(note => note.slug === activeNote.value.slug);
		if (note) {
			notes.value = notes.value.filter(note => note.slug !== activeNote.value.slug);
			navigateTo({ name: "notes", query: route.query });
		}
	};

	const unarchiveNote = () => {
		const note = notes.value.find(note => note.slug === activeNote.value.slug);
		if (note) {
			note.isArchived = false;
			updateNote(note);
			updateActiveNote(note);
			navigateTo({ name: "note", query: route.query, params: { slug: activeNote.value.slug } });
		}
	};

	return {
		activeNote,
		notes,
		isNewNote,
		saveNote,
		cancelChanges,
		archiveNote,
		unarchiveNote,
		deleteNote,
	};
});
