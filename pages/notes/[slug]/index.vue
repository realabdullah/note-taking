<script lang="ts" setup>
	import NotePlayground from "~/components/NotePlayground.vue";

	definePageMeta({
		name: "note",
		layout: "dashboard",
	});
</script>

<template>
	<NotePlayground usage="note" />
</template>
