export default defineNuxtRouteMiddleware(async () => {
	const { config } = storeToRefs(useStore());
	if (config.value.type === "appwrite") {
		const cookies = JSON.parse(localStorage.getItem("cookieFallback") || "[]");
		if (typeof cookies === "object" && !Object.keys(cookies).length) {
			useCookie("notes--st").value = "";
			return navigateTo({ name: "login" });
		}
	} else {
		const token = useCookie("notes--st");
		const session = await db.sessions
			.where("token")
			.equals(token.value || "")
			.first();

		if (!session || session.expiry < Date.now() || !token.value) {
			useCookie("notes--st").value = "";
			return navigateTo({ name: "login" });
		}
	}
});
