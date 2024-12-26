const api: Ref<NotesAPI | null> = ref(null);

export const useAPI = () => {
	const initializeAPI = async (config: APIConfig): Promise<void> => {
		if (config.type === "appwrite") {
			api.value = useAppwriteAPI();
			localStorage.setItem("api", "appwrite");
		} else if (config.type === "indexeddb") {
			api.value = useDexieDB();
			localStorage.setItem("api", "indexeddb");
		}
	};

	return {
		api,
		initializeAPI,
	};
};
