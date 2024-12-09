<script lang="ts" setup>
	const isDark = useIsDark();

	const search = ref<string>("");

	const route = useRoute();
	const isArchiveRoute = computed(() => route.name === "archive");
</script>

<template>
	<div
		class="sticky top-0 bg-white dark:bg-black z-50 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 py-[18.5px] px-8"
	>
		<h1 class="font-bold text-neutral-950 dark:text-white text-2xl">
			{{ isArchiveRoute ? "Archived Notes" : "All Notes" }}
		</h1>

		<div class="flex items-center gap-4">
			<UInput
				v-model="search"
				placeholder="Search by title, content, or tags…"
				icon="i-lucide-search"
				class="w-[300px]"
			/>
			<button>
				<CustomIcon name="settings" width="24" height="24" :fill="isDark ? '#99A0AE' : '#717784'" />
			</button>
		</div>
	</div>
</template>
