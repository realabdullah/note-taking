export default defineNuxtRouteMiddleware(() => {
	const token = useCookie("notes--st");
	if (token.value) {
		return navigateTo({ name: "notes" });
	}
});
