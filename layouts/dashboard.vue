<script lang="ts" setup>
	const { width } = useWindowSize();
	const isMobile = computed(() => width.value < 768);
</script>

<template>
	<div class="h-dvh w-dvw bg-white dark:bg-black overflow-auto scheme-light-dark">
		<TheBottomBar v-if="isMobile" />
		<TheSidebar v-else />
		<div class="w-full h-full" :class="[{ 'max-w-[calc(100vw-272px)]': !isMobile }]">
			<NuxtPage />
		</div>
	</div>
</template>
