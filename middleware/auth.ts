export default defineNuxtRouteMiddleware(async () => {
	const dbSrc = localStorage.getItem("api") as APItype;

	if (dbSrc === "appwrite") {
		const cookies = localStorage.getItem("cookieFallback");
		if (!cookies) {
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
