<script lang="ts" setup>
	import NotePlayground from "~/components/NotePlayground.vue";

	definePageMeta({
		name: "archived-note",
		layout: "dashboard",
	});
</script>

<template>
	<NotePlayground usage="archive" />
</template>
