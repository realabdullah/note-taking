export const useFontPreference = () => {
	const fontFamily = ref<FontFamily>((localStorage.getItem("font-family") as FontFamily) ?? "sans");

	const fontClasses: Record<FontFamily, string> = {
		sans: "font-inter",
		serif: "font-noto-serif",
		mono: "font-source-pro",
	};

	const setFontFamily = (font: FontFamily) => {
		fontFamily.value = font;
		localStorage.setItem("font-family", font);
		updateDocumentFontClass();
	};

	const updateDocumentFontClass = () => {
		Object.values(fontClasses).forEach(className => {
			document.documentElement.classList.remove(className);
		});

		document.documentElement.classList.add(fontClasses[fontFamily.value]);
	};

	onMounted(() => {
		updateDocumentFontClass();
	});

	return { fontFamily, setFontFamily };
};
