export default defineNuxtRouteMiddleware(async () => {
	const dbSrc = localStorage.getItem("api") as APItype;

	if (dbSrc === "appwrite") {
		const cookies = localStorage.getItem("cookieFallback");
		if (cookies) {
			return navigateTo({ name: "notes" });
		}
	} else {
		const token = useCookie("notes--st");
		if (token.value) {
			return navigateTo({ name: "notes" });
		}
	}
});
