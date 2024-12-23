export const useThemeMode = () => {
	const colorMode = useColorMode();

	const isDark = computed(() => ["system", "dark"].includes(colorMode.preference));

	const setColorMode = (mode: ColorMode) => {
		colorMode.value = mode;
		colorMode.preference = mode;
	};

	return {
		colorMode,
		isDark,
		setColorMode,
	};
};
