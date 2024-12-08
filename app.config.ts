export default defineAppConfig({
	ui: {
		colors: {
			primary: "blue",
		},
		textarea: {
			slots: {
				root: "w-full h-full",
				base: ["h-full", "w-full"],
			},
		},
	},
});
