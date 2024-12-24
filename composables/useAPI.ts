const api: Ref<NotesAPI | null> = ref(null);

export const useAPI = () => {
	const initializeAPI = async (config: APIConfig): Promise<void> => {
		if (config.type === "server" && config.serverUrl) {
			api.value = useServerAPI(config.serverUrl);
		} else {
			api.value = useDexieDB();
		}
	};

	return {
		api,
		initializeAPI,
	};
};
