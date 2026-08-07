export type AppearancePreference = "light" | "dark" | "system";
export type ThemePreference = AppearancePreference;
export type ColorTheme = "aubergine" | "moss" | "tide" | "clay" | "cobalt" | "poppy" | "lagoon" | "orchid";

export const useTheme = () => {
	const preference = useCookie<AppearancePreference>("fieldnote-theme", {
		default: () => "system",
		sameSite: "lax",
	});
	const colorTheme = useCookie<ColorTheme>("fieldnote-color-theme", {
		default: () => "aubergine",
		sameSite: "lax",
	});

	const applyTheme = () => {
		if (!import.meta.client) return;
		const resolved =
			preference.value === "system"
				? window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light"
				: preference.value;

		document.documentElement.dataset.theme = resolved;
		document.documentElement.dataset.palette = colorTheme.value;
	};

	const setColorTheme = (next: ColorTheme) => {
		if (colorTheme.value === next) return;
		colorTheme.value = next;
		applyTheme();
	};

	const setTheme = (next: ThemePreference) => {
		if (preference.value === next) return;

		preference.value = next;
		applyTheme();
	};

	onMounted(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		applyTheme();
		media.addEventListener("change", applyTheme);
		onBeforeUnmount(() => media.removeEventListener("change", applyTheme));
	});

	return { preference, colorTheme, setTheme, setColorTheme };
};
