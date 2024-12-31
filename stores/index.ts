export const useStore = defineStore(
	"store",
	() => {
		const route = useRoute();

		const config = ref<APIConfig>({
			type: (localStorage.getItem("notes-api") || "indexeddb") as APItype,
			serverUrl: import.meta.env.VITE_SERVER_URL,
		});

		const loadstates = reactive({
			signingUp: false,
			signingIn: false,
			loggingOut: false,
			fetchingNotes: false,
			fetchingNote: false,
			creatingNote: false,
			savingNote: false,
			deletingNote: false,
			isSettingPrefs: false,
			gettingPrefs: false,
			isUpdatingPassword: false,
			isRecoveringPassword: false,
		});
		const user = ref<User | null>(null);
		const userPrefs = ref<SettingsObj | null>(null);
		const pageHeader = ref("All Notes");
		const selectedMenu = ref<string>(`${route.path}`);
		const notes = ref<NoteObj[]>([]);
		const tags = computed(() => [...new Set(notes.value.flatMap(note => note.tags))]);
		const colorTheme = computed(() => userPrefs.value?.colorMode ?? ("light" as ColorMode));
		const fontFamily = computed(() => userPrefs.value?.fontFamily ?? "sans");
		const selectedTags = computed(() => {
			const tagsQ = useRoute().query.tags as string;
			return tagsQ
				? tagsQ
						.split(",")
						.map(tag => tag.trim())
						.filter(tag => tags.value.some(savedTag => savedTag.toLowerCase() === tag.toLowerCase()))
				: [];
		});

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

			return result;
		});

		const getNotes = async () => {
			const dbNotes = await useNuxtApp().$api.getAllNotes(isArchiveRoute.value);
			if (dbNotes) notes.value = dbNotes;
		};

		const addNewNote = async (note: NoteObj) => {
			const res = await useNuxtApp().$api.createNote(note);
			if (res) {
				notes.value.unshift(note);
				return navigateTo({ name: "note", query: route.query, params: { id: res.id } });
			}
		};

		const saveNote = async (note: NoteObj) => {
			await useNuxtApp().$api.updateNote(note.id, note);
		};

		const archiveOrRestoreNote = async (note: NoteObj) => {
			await saveNote(note);
			const routeName = note.isArchived ? "archived-note" : "notes";
			navigateTo({ name: routeName, query: route.query, params: { id: note.id } });
		};

		const deleteNote = async (id: string) => {
			const path = useRoute().name === "note" ? "/notes" : "/notes/archive";
			await useNuxtApp().$api.deleteNote(id);
			notes.value = notes.value.filter(note => note.id !== id);
			return navigateTo({ path, query: route.query });
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
			config,
			loadstates,
			user,
			userPrefs,
			colorTheme,
			fontFamily,
			pageHeader,
			selectedMenu,
			search,
			filteredNotes,
			notes,
			tags,
			selectedTags,
			getNotes,
			addNewNote,
			saveNote,
			archiveOrRestoreNote,
			deleteNote,
			handleTagClick,
			onNavigate,
		};
	},
	{ persist: { pick: ["user", "userPrefs", "config"] } }
);
