export const useIsDark = () => {
	const isUserPrefersDark = computed(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
	const colorMode = useColorMode();

	return computed(() => colorMode.value === "dark" || isUserPrefersDark.value);
};
