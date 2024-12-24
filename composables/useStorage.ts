const storage: Ref<NotesStorage | null> = ref(null);

export const useStorage = () => {
	const initializeStorage = async (config: StorageConfig): Promise<void> => {
		if (config.type === "server" && config.serverUrl) {
			storage.value = useServerStorage(config.serverUrl);
		} else {
			storage.value = useDexieStorage();
		}
	};

	return {
		storage,
		initializeStorage,
	};
};
