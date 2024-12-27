/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from "@/stores";

export default defineNuxtPlugin({
	name: "api-plugin",
	async setup(nuxtApp: any) {
		const { userPrefs } = storeToRefs(useStore());
		const config: APIConfig = {
			type: import.meta.env.VITE_DB_INSTANCE || "indexeddb",
			serverUrl: import.meta.env.VITE_SERVER_URL,
		};
		let api: NotesAPI;
		if (config.type === "appwrite") api = useAppwriteAPI();
		else api = useDexieDB();

		const middleware = nuxtApp._route.meta.middleware as string[];
		if (middleware && middleware.includes("auth")) {
			const prefs = await api.getAccountPrefs();
			if (prefs) {
				userPrefs.value = { ...userPrefs.value, ...prefs };
			}
		}

		return {
			provide: {
				api,
			},
		};
	},
});
