<script lang="ts" setup>
	definePageMeta({
		name: "archived-note",
		layout: "dashboard",
		middleware: ["auth"],
	});

	const { saveNote, archiveOrRestoreNote, deleteNote } = useStore();

	const originalNote = ref<NoteObj>({
		id: "",
		slug: "",
		title: "",
		content: "",
		tags: [],
		lastEdited: new Date(),
		isArchived: false,
	});
	const note = ref<NoteObj>({ ...originalNote.value });

	const route = useRoute();
	const { $api } = useNuxtApp();

	const getNote = async (fatal: boolean) => {
		const res = await $api.getNoteByID(route.params.id as string);
		if (isNoteObj(res)) {
			note.value = { ...res };
			originalNote.value = { ...res };
		} else {
			if (fatal) {
				throw showError({
					statusCode: 404,
					statusText: "Note not found",
					statusMessage: "The note you are looking for does not exist.",
					fatal: true,
				});
			} else {
				push.error({ title: "Error", message: "An error ocurred while saving note." });
			}
		}
	};
	onMounted(async () => {
		await getNote(true);
	});

	const onAction = async (action: NotePlaygroundActions) => {
		if (action === "save") {
			await saveNote({ ...note.value, lastEdited: new Date() });
			await getNote(false);
		} else if (action === "archive" || action === "unarchive") {
			await archiveOrRestoreNote({ ...note.value, isArchived: !note.value.isArchived });
		} else if (action === "delete") {
			await deleteNote(note.value.id);
		} else if (action === "cancel") {
			note.value = { ...originalNote.value };
		}
	};

	useSeoMeta({
		title: () => `${note.value?.title ?? ""} -- Archived Note`,
		description: () => note.value.content || "Note content",
		keywords: () => note.value.tags.join(", "),
	});
</script>

<template>
	<NotePlayground usage="archive" v-model="note" @action="onAction" />
</template>
