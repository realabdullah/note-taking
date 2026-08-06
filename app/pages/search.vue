<script setup lang="ts">
	definePageMeta({ middleware: "auth" });
	const route = useRoute();
	const query = typeof route.query.q === "string" ? { space: "search", q: route.query.q } : { space: "search" };
	await navigateTo({ path: "/", query }, { replace: true });
</script>
