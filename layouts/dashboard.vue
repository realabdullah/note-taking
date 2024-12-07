<script lang="ts" setup>
	const { width } = useWindowSize();
	const isMobile = computed(() => width.value < 768);
	const isTablet = computed(() => width.value < 1024 && width.value >= 768);
</script>

<template>
	<div class="h-dvh w-dvw bg-white dark:bg-black scheme-light-dark relative">
		<TheBottomBar v-if="isMobile || isTablet" />
		<TheSidebar v-else />

		<div
			class="w-full h-full overflow-hidden"
			:class="[
				{ 'max-w-[calc(100vw-272px)] ml-auto fixed top-0 left-[272px] z-50': !isMobile && !isTablet },
				{ 'bg-neutral-100': isMobile && isTablet },
			]"
		>
			<TheHeader v-if="!isMobile && !isTablet" />
			<div class="overflow-y-auto h-full">
				<div class="grid h-full" :class="[isMobile || isTablet ? 'grid-cols-1' : 'grid-cols-12']">
					<div
						class="border-r border-neutral-200 dark:border-neutral-800 col-span-3 px-4 pb-28 h-full overflow-x-hidden overflow-y-auto"
					>
						<Notesbar />
					</div>

					<div class="col-span-6 py-6 px-5">
						<NuxtPage />
					</div>

					<div
						class="border-l border-neutral-200 dark:border-neutral-800 col-span-2 px-4 py-5 h-full overflow-x-hidden overflow-y-auto"
					></div>
				</div>
			</div>
		</div>
	</div>
</template>
