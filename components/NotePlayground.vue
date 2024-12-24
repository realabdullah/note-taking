<script lang="ts" setup>
	import { useStore } from "~/stores";

	defineProps<{ usage: "note" | "archive" }>();

	const { saveNote, cancelChanges, archiveNote, deleteNote, unarchiveNote } = useStore();
	const { activeNote, notes, isNewNote } = storeToRefs(useStore());

	const { isDesktop } = useDeviceType();
	const { isDark } = useThemeMode();
	const route = useRoute();

	const goBack = () => {
		const query = route.query;
		navigateTo({ name: "notes", query });
	};

	const tags = computed({
		get: () => activeNote.value.tags.join(", "),
		set: (value: string) => {
			activeNote.value.tags = value.split(",").map(tag => tag.trim());
		},
	});

	watch(
		() => notes.value,
		() => {
			const dNote = notes.value.find(note => note.slug === route.params.slug);
			if (dNote) activeNote.value = { ...dNote };
			else {
				activeNote.value = {
					slug: route.params.slug as string,
					title: "",
					content: "",
					tags: [],
					lastEdited: Date.now(),
					isArchived: false,
				};
			}
		},
		{ once: true }
	);
</script>

<template>
	<div
		class="grid"
		:class="[
			isDesktop
				? 'grid-cols-9 grid-rows-[calc(100dvh-74px)]'
				: 'grid-cols-6 overflow-hidden grid-rows-[calc(100dvh-131px)]',
		]"
	>
		<div class="relative col-span-6 h-full overflow-x-hidden overflow-y-auto">
			<div class="px-2 py-6 lg:px-5 sticky top-0 bg-white dark:bg-black z-50">
				<div
					v-if="!isDesktop"
					class="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3"
				>
					<UButton
						variant="ghost"
						icon="i-lucide-chevron-left"
						label="Go back"
						class="font-normal text-sm text-neutral-600 dark:text-neutral-300"
						@click="goBack"
					/>

					<div class="flex items-center gap-4">
						<template v-if="!isNewNote">
							<DeleteNoteModal @delete="deleteNote">
								<button>
									<CustomIcon
										name="delete"
										width="18"
										height="18"
										:stroke="isDark ? '#CACFD8' : '#0E121B'"
									/>
								</button>
							</DeleteNoteModal>
							<ArchiveNoteModal
								:is-archived="activeNote.isArchived"
								@archive="activeNote.isArchived ? unarchiveNote() : archiveNote()"
							>
								<button>
									<CustomIcon
										name="archive"
										width="18"
										height="18"
										:stroke="isDark ? '#CACFD8' : '#0E121B'"
									/>
								</button>
							</ArchiveNoteModal>
						</template>
						<button
							variant="ghost"
							class="font-normal text-sm text-neutral-600 dark:text-neutral-300"
							@click="cancelChanges"
						>
							Cancel
						</button>
						<button variant="ghost" class="font-normal text-sm text-blue-500" @click="saveNote">
							Save Note
						</button>
					</div>
				</div>

				<UInput
					v-model="activeNote.title"
					variant="none"
					size="xl"
					placeholder="Enter a title…"
					:ui="{ root: 'w-full', base: 'w-full p-0 font-bold text-2xl text-neutral-950 dark:text-white' }"
				/>

				<div class="mt-4 grid grid-cols-[115px_1fr] gap-2 items-center">
					<div class="space-y-2">
						<div class="flex items-center gap-[6px]">
							<CustomIcon name="tag" width="16" height="16" :stroke="isDark ? '#E0E4EA' : '#2B303B'" />
							<span class="font-normal text-sm text-neutral-700 dark:text-neutral-300">Tags</span>
						</div>
						<div class="flex items-center gap-[6px]">
							<CustomIcon name="clock" width="16" height="16" :fill="isDark ? '#E0E4EA' : '#2B303B'" />
							<span class="font-normal text-sm text-neutral-700 dark:text-neutral-300">Last edited</span>
						</div>
					</div>

					<div class="space-y-2">
						<UInput
							v-model="tags"
							variant="none"
							size="lg"
							placeholder="Add tags separated by commas (e.g. Work, Planning)"
							:ui="{
								root: 'w-full',
								base: 'w-full p-0 font-normal text-sm text-neutral-400 dark:text-white',
							}"
						/>
						<p class="font-normal text-sm text-neutral-400 dark:text-white">
							{{
								isNewNote
									? "Not yet saved"
									: activeNote?.lastEdited
										? formatDate(activeNote?.lastEdited)
										: "N/A"
							}}
						</p>
					</div>
				</div>

				<div class="my-4">
					<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />
				</div>
			</div>

			<div class="px-2 lg:px-5 w-full overflow-hidden" :class="[isDesktop ? 'min-h-[66dvh]' : 'min-h-[50dvh]']">
				<UTextarea
					v-model="activeNote.content"
					:placeholder="isNewNote ? 'Start typing your note here…' : 'Type something...'"
					class=""
					size="xl"
					variant="none"
					autoresize
				/>
			</div>

			<div
				v-if="isDesktop"
				class="sticky right-0 left-0 bottom-0 mx-2 bg-white dark:bg-black lg:mx-5 border-t border-neutral-200 dark:border-neutral-800 py-4 space-x-4"
			>
				<button
					class="bg-blue-500 text-white rounded-lg py-3 px-4 cursor-pointer"
					@click="saveNote(activeNote)"
				>
					Save Note
				</button>
				<button
					class="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg py-3 px-4 cursor-pointer"
					@click="cancelChanges(activeNote.slug)"
				>
					Cancel
				</button>
			</div>
		</div>

		<div
			class="col-span-3 border-l border-neutral-200 dark:border-neutral-800 px-4 py-5 h-full overflow-x-hidden overflow-y-auto"
		>
			<NoteAction
				v-if="isDesktop && !isNewNote"
				:is-archived="activeNote.isArchived"
				@archive="archiveNote"
				@delete="deleteNote"
				@restore="unarchiveNote"
			/>
		</div>
	</div>
</template>
