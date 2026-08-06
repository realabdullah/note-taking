<script setup lang="ts">
	const route = useRoute();
	const routeTransitionName = ref("page-forward");

	const routeRank = (path: string) => {
		if (path === "/") return 0;
		if (path.startsWith("/notes")) return 1;
		if (path === "/search") return 2;
		if (path === "/archive") return 3;
		if (path === "/settings") return 4;
		return 0;
	};

	watch(
		() => route.path,
		(to, from) => {
			routeTransitionName.value = routeRank(to) >= routeRank(from ?? to) ? "page-forward" : "page-back";
		}
	);

	const pageTransition = computed(() => ({
		name: routeTransitionName.value,
		mode: "out-in" as const,
	}));

	const themeInitScript = `(() => {
  try {
    const cookie = document.cookie.split("; ").find((entry) => entry.startsWith("fieldnote-theme="))
    const colorCookie = document.cookie.split("; ").find((entry) => entry.startsWith("fieldnote-color-theme="))
    const preference = cookie ? decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1)) : "system"
    const palette = colorCookie ? decodeURIComponent(colorCookie.slice(colorCookie.indexOf("=") + 1)) : "aubergine"
    const theme = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light"
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.palette = palette
  } catch {}
})()`;

	useHead({
		htmlAttrs: { lang: "en" },
		meta: [
			{ name: "theme-color", content: "#2f1838" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-status-bar-style", content: "default" },
		],
		link: [{ rel: "apple-touch-icon", href: "/icons/icon-192.svg.png" }],
		script: [
			{
				key: "fieldnote-theme-init",
				innerHTML: themeInitScript,
				tagPosition: "head",
				tagPriority: "critical",
			},
		],
	});
</script>

<template>
	<NuxtLoadingIndicator color="#e9673f" :height="2" />
	<NuxtLayout>
		<NuxtPage :transition="pageTransition" />
	</NuxtLayout>
</template>
