export default defineNuxtRouteMiddleware(async () => {
	const { config } = storeToRefs(useStore());
	if (config.value.type === "appwrite") {
		const cookies = JSON.parse(localStorage.getItem("cookieFallback") || "[]");
		if (typeof cookies === "object" && Object.keys(cookies).length) {
			return navigateTo({ name: "notes" });
		}
	} else {
		const token = useCookie("notes--st");
		if (token.value) {
			return navigateTo({ name: "notes" });
		}
	}
});
