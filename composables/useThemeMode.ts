export const useThemeMode = () => {
	const { $api } = useNuxtApp();
	const { colorTheme } = storeToRefs(useStore());

	const colorMode = useColorMode();

	const isDark = computed(() => ["system", "dark"].includes(colorTheme.value));

	const setColorMode = async (mode: ColorMode) => {
		await $api.setAccountPrefs({ colorMode: mode });
	};

	watch(
		() => colorTheme.value,
		() => {
			colorMode.value = colorTheme.value;
			colorMode.preference = colorTheme.value;
		},
		{ immediate: true }
	);

	return {
		colorMode,
		isDark,
		setColorMode,
	};
};
