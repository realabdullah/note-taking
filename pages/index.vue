<script lang="ts" setup>
	definePageMeta({
		middleware: ["auth", () => navigateTo("/notes")],
	});
</script>

<template>
	<div></div>
</template>
