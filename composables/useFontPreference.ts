export const useFontPreference = () => {
	const { $api } = useNuxtApp();
	const { fontFamily } = storeToRefs(useStore());

	const fontClasses: Record<FontFamily, string> = {
		sans: "font-inter",
		serif: "font-noto-serif",
		mono: "font-source-pro",
	};

	const setFontFamily = async (font: FontFamily) => {
		await $api.setAccountPrefs({ fontFamily: font });
		updateDocumentFontClass();
	};

	const updateDocumentFontClass = () => {
		Object.values(fontClasses).forEach(className => {
			document.documentElement.classList.remove(className);
		});

		document.documentElement.classList.add(fontClasses[fontFamily.value]);
	};

	watch(
		() => fontFamily.value,
		() => {
			updateDocumentFontClass()
		},
		{ immediate: true }
	);

	return { setFontFamily };
};
