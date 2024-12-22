<script lang="ts" setup>
	definePageMeta({
		name: "notes",
		layout: "dashboard",
	});

	const { pageHeader } = storeToRefs(useStore());
	pageHeader.value = "All Notes"
</script>

<template>
	<div></div>
</template>
