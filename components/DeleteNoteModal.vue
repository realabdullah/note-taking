<script lang="ts" setup>
	const open = ref(false);

	const { isDark } = useThemeMode();

	defineEmits<(event: "delete") => void>();

	const { loadstates } = storeToRefs(useStore());
</script>

<template>
	<UModal v-model:open="open" :dismissible="loadstates.deletingNote">
		<slot />

		<template #content>
			<div class="rounded-xl py-5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
				<div class="flex items-start gap-4 px-5 pb-5">
					<CustomIcon
						name="delete"
						width="24"
						height="24"
						:stroke="isDark ? '#FFFFFF' : '#0E121B'"
						class-name="rounded-lg h-10 w-10 flex items-center justify-center p-2 bg-neutral-100 dark:bg-neutral-600"
					/>

					<div class="space-y-2">
						<h4 class="font-semibold text-base text-neutral-950 dark:text-white">Delete Note</h4>
						<p class="font-normal text-sm text-neutral-700 dark:text-neutral-200">
							Are you sure you want to permanently delete this note? This action cannot be undone.
						</p>
					</div>
				</div>

				<div
					class="p-5 pb-0 border-t border-neutral-200 dark:border-neutral-600 flex items-center justify-end gap-4"
				>
					<button
						class="py-3 px-4 text-neutral-600 dark:text-neutral-200 font-medium text-sm rounded-lg bg-neutral-100 dark:bg-neutral-500"
						:disabled="loadstates.deletingNote"
						@click="open = false"
					>
						Cancel
					</button>
					<button
						class="py-3 px-4 text-white font-medium text-sm rounded-lg bg-red-500"
						:disabled="loadstates.deletingNote"
						@click="$emit('delete')"
					>
						<IsLoading v-if="loadstates.deletingNote" title="Deleting.." />
						<template v-else>Delete Note</template>
					</button>
				</div>
			</div>
		</template>
	</UModal>
</template>
