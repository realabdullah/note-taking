export default defineNuxtRouteMiddleware(async () => {
	const token = useCookie("notes--st");
	const session = await db.sessions
		.where("token")
		.equals(token.value || "")
		.first();

	if (!session || session.expiry < Date.now() || !token.value) {
		useCookie("notes--st").value = "";
		return navigateTo({ name: "login" });
	}
});
