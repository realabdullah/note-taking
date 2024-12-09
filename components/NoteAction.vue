<script lang="ts" setup>
	defineProps<{ isArchived: boolean }>();

	type EmitsEvent = "archive" | "delete" | "restore";
	const emits = defineEmits<{
		(event: EmitsEvent): void;
	}>();

	const isDark = useIsDark();

	const onAction = (action: "archive" | "delete" | "restore") => {
		emits(action);
	};
</script>

<template>
	<div class="space-y-3">
		<button
			class="w-full flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 py-3 px-4 cursor-pointer hover:bg-opacity-70"
			@click="onAction(isArchived ? 'restore' : 'archive')"
		>
			<CustomIcon
				:name="isArchived ? 'restore' : 'archive'"
				width="20"
				height="20"
				:stroke="isDark ? '#FFFFFF' : '#0E121B'"
				:fill="isDark ? '#FFFFFF' : '#0E121B'"
			/>
			<p class="font-medium text-sm text-neutral-950 dark:text-white">
				{{ isArchived ? "Restore Note" : "Archive Note" }}
			</p>
		</button>

		<button
			class="w-full flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 py-3 px-4 cursor-pointer hover:bg-opacity-70"
			@click="onAction('delete')"
		>
			<CustomIcon name="delete" width="20" height="20" :stroke="isDark ? '#FFFFFF' : '#0E121B'" />
			<p class="font-medium text-sm text-neutral-950 dark:text-white">Delete Note</p>
		</button>
	</div>
</template>
