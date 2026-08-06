import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@vite-pwa/nuxt"],
	css: ["~/assets/css/main.css"],
	compatibilityDate: "2026-07-29",
	devtools: { enabled: true },
	vite: {
		plugins: [tailwindcss()],
	},
	runtimeConfig: {
		databaseUrl: "",
		betterAuthSecret: "",
		betterAuthUrl: "",
		googleClientId: "",
		googleClientSecret: "",
		resendApiKey: "",
		emailFrom: "Fieldnote <notes@example.com>",
		public: {
			appName: "Fieldnote",
			googleAuthEnabled: Boolean(process.env.NUXT_GOOGLE_CLIENT_ID && process.env.NUXT_GOOGLE_CLIENT_SECRET),
		},
	},
	nitro: {
		preset: "vercel",
	},
	pwa: {
		registerType: "prompt",
		includeAssets: ["favicon.ico", "fonts/*.woff2"],
		manifest: {
			name: "Fieldnote",
			short_name: "Fieldnote",
			description: "A quiet, local-first notebook that follows you across devices.",
			theme_color: "#2f1838",
			background_color: "#f7f0e8",
			display: "standalone",
			start_url: "/",
			scope: "/",
			categories: ["productivity", "utilities"],
			icons: [
				{
					src: "/icons/icon-192.svg.png",
					sizes: "192x192",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "/icons/icon-512.svg.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "any maskable",
				},
			],
			shortcuts: [
				{
					name: "Capture a note",
					short_name: "New note",
					url: "/?capture=1",
					icons: [{ src: "/icons/icon-192.svg.png", sizes: "192x192", type: "image/png" }],
				},
			],
		},
		workbox: {
			navigateFallback: "/",
			globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf,woff2}"],
			navigateFallbackDenylist: [/^\/api\//],
			runtimeCaching: [],
			cleanupOutdatedCaches: true,
		},
		devOptions: {
			enabled: true,
			type: "module",
			navigateFallback: "/",
			suppressWarnings: true,
		},
	},
});
