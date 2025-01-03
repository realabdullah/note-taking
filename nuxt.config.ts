// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	modules: ["@nuxt/ui", "@vueuse/nuxt", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt", "notivue/nuxt"],
	css: ["~/assets/css/main.css", "notivue/notification.css", "notivue/animations.css"],
	icon: {
		customCollections: [
			{
				prefix: "custom",
				dir: "./assets/icons",
			},
		],
	},
	fonts: {
		assets: {
			prefix: "/_fonts/",
		},
		families: [
			{ name: "Source Code Pro", provider: "local" },
			{ name: "Inter", provider: "local" },
			{ name: "Noto Serif", provider: "local" },
		],
		defaults: {
			weights: [400, 500, 600, 700],
			styles: ["normal"],
		},
		experimental: {
			processCSSVariables: true,
		},
	},
	imports: {
		dirs: ["utils", "utils/**", "assets/constants", "assets/constants/**", "types"],
	},
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
});
