export default defineNuxtRouteMiddleware(async () => {
	const dbSrc = localStorage.getItem("api") as APItype;

	if (dbSrc === "appwrite") {
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
