<script setup lang="ts">
	definePageMeta({ middleware: "auth" });
	await navigateTo({ path: "/", query: { space: "library" } }, { replace: true });
</script>
