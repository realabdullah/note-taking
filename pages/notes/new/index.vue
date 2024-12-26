<script lang="ts" setup>
import type { NoteObj, NotePlaygroundActions } from '~/types';

	definePageMeta({
		name: "new-note",
		layout: "dashboard",
		middleware: ["auth"],
	});

	const note = ref<NoteObj>({
		id: "",
		slug: "",
		title: "",
		content: "",
		tags: [],
		lastEdited: new Date(),
		isArchived: false,
	});

	const { addNewNote } = useStore();
	const onAction = (action: NotePlaygroundActions) => {
		if (action === "save") {
			addNewNote(note.value);
		} else if (action === "cancel") {
            for (const k in note.value) {
                const key = k as keyof NoteObj;
                if (typeof note.value[key] === "string") (note.value[key] as string) = "";
                else if (Array.isArray(note.value[key])) (note.value[key] as string[]) = [];
            }
        }
	};
</script>

<template>
	<NotePlayground usage="new" v-model="note" @action="onAction" />
</template>
