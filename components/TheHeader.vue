<script lang="ts" setup>
	const isDark = useIsDark();

	const route = useRoute();
	const isArchiveRoute = computed(() => ["archive", "archived-note"].includes(route.name as string));

	const { selectedTags, search, pageHeader } = storeToRefs(useStore());
</script>

<template>
	<div
		class="sticky top-0 bg-white dark:bg-black z-50 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 py-[18.5px] px-8"
	>
		<h1 v-if="search" class="inline-flex font-bold text-neutral-600 dark:text-neutral-300 text-2xl">
			Showing results for:
			<span
				class="block whitespace-nowrap overflow-hidden font-bold text-neutral-950 dark:text-white text-ellipsis w-[200px]"
			>
				"{{ search }}"
			</span>
		</h1>
		<h1 v-else-if="$route.query.tags" class="font-bold text-neutral-600 dark:text-neutral-300 text-2xl">
			{{ isArchiveRoute ? "Archived Notes" : "Notes " }} Tagged:
			<span class="font-bold text-neutral-950 dark:text-white">"{{ selectedTags.join(", ") }}"</span>
		</h1>
		<h1 v-else class="font-bold text-neutral-950 dark:text-white text-2xl">
			{{ isArchiveRoute ? "Archived Notes" : pageHeader }}
		</h1>

		<div class="flex items-center gap-4">
			<UInput
				v-model="search"
				placeholder="Search by title, content, or tags…"
				icon="i-lucide-search"
				class="w-[300px]"
			/>
			<NuxtLink to="/settings">
				<CustomIcon name="settings" width="24" height="24" :fill="isDark ? '#99A0AE' : '#717784'" />
			</NuxtLink>
		</div>
	</div>
</template>
