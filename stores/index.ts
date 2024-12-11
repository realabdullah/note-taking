import type { NoteObj } from "~/types";
import { notesData } from "@/assets/constants";

export const useStore = defineStore("store", () => {
	const route = useRoute();

	const selectedMenu = ref<string>(`${route.path}`);
	const activeNote = ref<NoteObj>({
		slug: "",
		title: "",
		content: "",
		tags: [],
		lastEdited: new Date(),
		isArchived: false,
	});
	const notes = ref<NoteObj[]>([...notesData]);
	const tags = computed(() => [...new Set(notes.value.flatMap(note => note.tags))]);

	const selectedTags = computed(() => {
		const tagsQ = useRoute().query.tags as string;
		return tagsQ
			? tagsQ
					.split(",")
					.map(tag => tag.trim())
					.filter(tag => tags.value.some(savedTag => savedTag.toLowerCase() === tag.toLowerCase()))
			: [];
	});
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

	const handleTagClick = (tag: string) => {
		const index = selectedTags.value.indexOf(tag);
		const path = useRoute().path;

		const query = useRoute().query;
		if (index === -1) {
			navigateTo({ path, query: { ...query, tags: [...selectedTags.value, tag].join(",") } });
		} else {
			const tagsQ = selectedTags.value.filter(t => t !== tag);
			navigateTo({ path, query: { ...query, tags: tagsQ.join(",") || undefined } });
		}

		selectedMenu.value = path;
	};

	const onNavigate = (link: string) => {
		selectedMenu.value = link;
		if (link.includes("/")) {
			const query = route.query;
			navigateTo({ path: link, query: { ...query } });
		}
	};

	return {
		selectedMenu,
		activeNote,
		notes,
		tags,
		selectedTags,
		isNewNote,
		saveNote,
		cancelChanges,
		archiveNote,
		unarchiveNote,
		deleteNote,
		handleTagClick,
		onNavigate,
	};
});
