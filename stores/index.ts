import type { NoteObj } from "~/types";

export const useStore = defineStore(
	"store",
	() => {
		const { api } = useAPI();

		const route = useRoute();

		const user = ref<User | null>(null);
		const pageHeader = ref("All Notes");
		const selectedMenu = ref<string>(`${route.path}`);
		const activeNote = ref<NoteObj>({
			slug: "",
			title: "",
			content: "",
			tags: [],
			lastEdited: new Date(),
			isArchived: false,
		});
		const notes = ref<NoteObj[]>([]);
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
		const isNewNote = computed(
			() =>
				activeNote.value.slug.includes("new-note-") ||
				!notes.value.find(({ slug }) => slug === activeNote.value.slug)
		);

		const search = ref<string>("");
		const isArchiveRoute = computed(() => ["archive", "archived-note"].includes(route.name as string));
		const filteredNotes = computed(() => {
			let result = notes.value;

			const tags = (route.query.tags as string)?.split(",");
			if (tags) {
				result = result.filter(note => tags.some(tag => note.tags.includes(tag)));
			}

			const normalizedSearchTerm = search.value.toLowerCase().trim();
			if (normalizedSearchTerm) {
				result = result.filter(note => {
					const titleMatch = note.title.toLowerCase().includes(normalizedSearchTerm);
					const contentMatch = note.content.toLowerCase().includes(normalizedSearchTerm);
					const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(normalizedSearchTerm));
					return titleMatch || contentMatch || tagMatch;
				});
			}

			return isArchiveRoute.value
				? result.filter(note => note.isArchived)
				: result.filter(note => !note.isArchived);
		});

		const getFreshNotes = async () => {
			const dbNotes = await api.value?.getAllNotes();
			if (dbNotes) notes.value = dbNotes;
		};

		const updateActiveNote = (note: NoteObj) => {
			activeNote.value = { ...note };
		};

		const updateNote = async (note: NoteObj) => {
			await api.value?.updateNote(note.slug, note);
			await getFreshNotes();
		};

		const saveNote = async () => {
			if (isNewNote.value) {
				if (!activeNote.value.title.trim()) return;
				activeNote.value.slug = slugify(activeNote.value.title);
				api.value?.createNote(activeNote.value);
				await getFreshNotes();
				navigateTo({ name: "note", query: route.query, params: { slug: activeNote.value.slug } });
				return;
			}

			const note = notes.value.find(note => note.slug === activeNote.value.slug);
			if (note && JSON.stringify(note) === JSON.stringify(activeNote.value)) {
				return;
			}

			activeNote.value.lastEdited = new Date();
			await api.value?.updateNote(activeNote.value.slug, activeNote.value);
			await getFreshNotes();
		};

		const cancelChanges = async () => {
			const note = notes.value.find(note => note.slug === activeNote.value.slug);
			if (note) {
				updateActiveNote(note);
				await getFreshNotes();
			}
		};

		const archiveNote = async () => {
			const note = await api.value?.getNoteBySlug(activeNote.value.slug);
			if (note) {
				note.isArchived = true;
				await updateNote(note);
				updateActiveNote(note);
				navigateTo({ name: "archived-note", query: route.query, params: { slug: activeNote.value.slug } });
			}
		};

		const deleteNote = async () => {
			const note = notes.value.find(note => note.slug === activeNote.value.slug);
			if (note) {
				const path = useRoute().name === "note" ? "/notes" : "/notes/archive";
				await api.value?.deleteNote(note.slug);
				await getFreshNotes();
				activeNote.value = {
					slug: "",
					title: "",
					content: "",
					tags: [],
					lastEdited: new Date(),
					isArchived: false,
				};
				return navigateTo({ path, query: route.query });
			}
		};

		const unarchiveNote = async () => {
			const note = notes.value.find(note => note.slug === activeNote.value.slug);
			if (note) {
				note.isArchived = false;
				await updateNote(note);
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
			user,
			pageHeader,
			selectedMenu,
			search,
			filteredNotes,
			activeNote,
			notes,
			tags,
			selectedTags,
			isNewNote,
			getFreshNotes,
			saveNote,
			cancelChanges,
			archiveNote,
			unarchiveNote,
			deleteNote,
			handleTagClick,
			onNavigate,
		};
	},
	{ persist: { pick: ["user"] } }
);
