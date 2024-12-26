<script lang="ts" setup>
	defineProps<{ isArchived: boolean }>();

	const open = ref(false);

	const { loadstates } = storeToRefs(useStore());
	const { isDark } = useThemeMode();

	defineEmits<(event: "archive") => void>();
</script>

<template>
	<UModal v-model:open="open" :dismissible="loadstates.savingNote">
		<slot />

		<template #content>
			<div class="rounded-xl py-5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
				<div class="flex items-start gap-4 px-5 pb-5">
					<CustomIcon
						name="archive"
						width="24"
						height="24"
						:stroke="isDark ? '#FFFFFF' : '#0E121B'"
						class-name="rounded-lg h-10 w-10 flex items-center justify-center p-2 bg-neutral-100 dark:bg-neutral-600"
					/>

					<div class="space-y-2">
						<h4 class="font-semibold text-base text-neutral-950 dark:text-white">
							{{ isArchived ? "Restore" : "Archive" }} Note
						</h4>
						<p class="font-normal text-sm text-neutral-700 dark:text-neutral-200">
							<template v-if="isArchived">
								Are you sure you want to restore this note? It will be moved back to your main notes
								list.
							</template>
							<template v-else>
								Are you sure you want to archive this note? You can find it in the Archived Notes
								section and restore it anytime.
							</template>
						</p>
					</div>
				</div>

				<div
					class="p-5 pb-0 border-t border-neutral-200 dark:border-neutral-600 flex items-center justify-end gap-4"
				>
					<button
						class="py-3 px-4 text-neutral-600 dark:text-neutral-200 font-medium text-sm rounded-lg bg-neutral-100 dark:bg-neutral-500"
						:disabled="loadstates.savingNote"
						@click="open = false"
					>
						Cancel
					</button>
					<button
						class="py-3 px-4 text-white font-medium text-sm rounded-lg bg-blue-500"
						:disabled="loadstates.savingNote"
						@click="$emit('archive')"
					>
						<IsLoading v-if="loadstates.savingNote" :title="isArchived ? 'Restoring...' : 'Archiving...'" />
						<template v-else>{{ isArchived ? "Restore" : "Archive" }} Note</template>
					</button>
				</div>
			</div>
		</template>
	</UModal>
</template>
