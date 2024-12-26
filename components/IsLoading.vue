<script lang="ts" setup>
	defineProps<{ title: string }>();
</script>

<template>
	<div class="loader text-base tracking-[0.5px] pb-2 font-normal">{{ title }}</div>
</template>

<style scoped>
	.loader {
		width: fit-content;
		background: linear-gradient(currentColor 0 0) 0 100%/0% 1px no-repeat;
		animation: lKey 2s linear infinite;
	}

	.loader:before {
		content: v-bind(title);
	}

	@keyframes lKey {
		to {
			background-size: 100% 1px;
		}
	}
</style>
