<script lang="ts" setup>
	const { width } = useWindowSize();
	const isMobile = computed(() => width.value < 768);
	const isTablet = computed(() => width.value < 1024 && width.value >= 768);
</script>

<template>
	<div class="h-dvh w-dvw bg-white dark:bg-black scheme-light-dark relative grid grid-cols-10 grid-rows-[100dvh]">
		<TheBottomBar v-if="isMobile || isTablet" />
		<TheSidebar v-else />

		<div class="col-span-8" :class="[{ 'bg-neutral-100': isMobile && isTablet }]">
			<TheHeader v-if="!isMobile && !isTablet" />
			<div
				class="grid"
				:class="[isMobile || isTablet ? 'grid-cols-1' : 'grid-cols-12 grid-rows-[calc(100dvh-74px)]']"
			>
				<div
					class="border-r border-neutral-200 dark:border-neutral-800 col-span-3 px-4 h-full overflow-x-hidden overflow-y-auto"
				>
					<Notesbar />
				</div>

				<div class="col-span-6 h-full overflow-x-hidden overflow-y-auto">
					<NuxtPage />
				</div>

				<div
					class="border-l border-neutral-200 dark:border-neutral-800 col-span-2 px-4 py-5 h-full overflow-x-hidden overflow-y-auto"
				></div>
			</div>
		</div>
	</div>
</template>
