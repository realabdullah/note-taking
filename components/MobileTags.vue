<script lang="ts" setup>
	const { tags, selectedTags } = storeToRefs(useStore());
	const { handleTagClick } = useStore();

	const isDark = useIsDark();
</script>

<template>
	<nav
		class="fixed z-40 overflow-y-auto left-0 right-0 bottom-[57px] top-[74px] space-y-4 p-4 bg-white dark:bg-black rounded-t-2xl cols-span-full grid-cols-1 grid-rows-[calc(100dvh-131px)]"
	>
		<h6 class="px-2 text-2xl font-bold text-neutral-950 dark:text-white">Tags</h6>

		<div v-for="tag in tags" :key="tag" class="space-y-1">
			<button
				class="border-b border-neutral-200 dark:border-neutral-800 w-full flex items-center gap-2 py-2.5 px-3 pb-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
				:class="{ 'bg-neutral-100 dark:bg-neutral-800': selectedTags.includes(tag) }"
				@click="handleTagClick(tag)"
			>
				<CustomIcon name="tag" width="20" height="20" :stroke="isDark ? '#E0E4EA' : '#2B303B'" />
				<p class="font-medium text-sm text-neutral-700 dark:text-neutral-200">{{ tag }}</p>
			</button>
		</div>
	</nav>
</template>
