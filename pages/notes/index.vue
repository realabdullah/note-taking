<script lang="ts" setup>
	definePageMeta({
		name: "notes",
		layout: "dashboard",
		middleware: ["auth"],
	});

	const { pageHeader } = storeToRefs(useStore());
	pageHeader.value = "All Notes"

	useSeoMeta({
		title: "All Notes",
		description: "All notes in one place",
		keywords: "notes, all notes",
	});
</script>

<template>
	<div></div>
</template>
