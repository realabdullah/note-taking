<script lang="ts" setup>
	definePageMeta({
		layout: "dashboard",
	});

	const { isDesktop } = useDeviceType();

	const route = useRoute();
	const isRouteNote = computed(() => !!route.params?.slug);

	const isArchiveRoute = computed(() => route.name.includes("archive"));
</script>

<template>
	<div
		class="grid"
		:class="[
			isDesktop ? 'grid-cols-12 grid-rows-[calc(100dvh-74px)]' : 'grid-cols-1 grid-rows-[calc(100dvh-131px)]',
		]"
	>
		<div
			class="px-4 h-full"
			:class="[
				isDesktop
					? 'border-r border-neutral-200 dark:border-neutral-800 col-span-3 overflow-x-hidden overflow-y-auto'
					: 'bg-white dark:bg-black rounded-t-2xl cols-span-full overflow-hidden',
			]"
		>
			<Notesbar v-if="isDesktop || !isRouteNote" :usage="isArchiveRoute ? 'archive' : 'all'" />
			<NuxtPage v-if="isRouteNote && !isDesktop" />
		</div>

		<template v-if="isDesktop">
			<div class="col-span-9 h-full overflow-x-hidden overflow-y-auto">
				<NuxtPage />
			</div>
		</template>
	</div>
</template>
