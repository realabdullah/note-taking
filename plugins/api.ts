/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from "@/stores";

export default defineNuxtPlugin({
	name: "api-plugin",
	async setup(nuxtApp: any) {
		const { userPrefs, config } = storeToRefs(useStore());
		let api: NotesAPI;
		if (config.value.type === "appwrite") api = useAppwriteAPI();
		else api = useDexieDB();

		const middleware = nuxtApp._route.meta.middleware as string[];
		if (middleware && middleware.includes("auth")) {
			const prefs = await api.getAccountPrefs();
			if (prefs) userPrefs.value = { ...userPrefs.value, ...prefs };
		}

		return {
			provide: {
				api,
			},
		};
	},
});
