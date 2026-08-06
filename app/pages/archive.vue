<script setup lang="ts">
	definePageMeta({ middleware: "auth" });
	await navigateTo({ path: "/", query: { space: "archive" } }, { replace: true });
</script>
