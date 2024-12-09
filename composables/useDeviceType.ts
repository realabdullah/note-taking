export const useDeviceType = () => {
	const { width } = useWindowSize();
	const isDesktop = computed(() => width.value >= 1024);

	return {
        isDesktop
	};
};
