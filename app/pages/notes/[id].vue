<script setup lang="ts">
	definePageMeta({ middleware: "auth" });
	const route = useRoute();
	await navigateTo({ path: "/", query: { note: String(route.params.id) } }, { replace: true });
</script>
