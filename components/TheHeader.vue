<script lang="ts" setup>
	const search = ref<string>("");
</script>

<template>
	<div
		class="sticky top-0 bg-white dark:bg-black z-50 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 py-[18.5px] px-8"
	>
		<h1 class="font-bold text-neutral-950 dark:text-white text-2xl">All Notes</h1>

		<div class="flex items-center gap-4">
			<UInput
				v-model="search"
				placeholder="Search by title, content, or tags…"
				icon="i-lucide-search"
				class="w-[300px]"
			/>
			<UButton variant="ghost" size="sm">
				<CustomIcon name="settings" width="24" height="24" />
			</UButton>
		</div>
	</div>
</template>
