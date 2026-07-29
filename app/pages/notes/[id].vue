<script setup lang="ts">
definePageMeta({ middleware: "auth" })

const route = useRoute()
const { notes, isReady, updateNote, changeArchiveState, deleteNote } = useNotes()
const noteId = computed(() => String(route.params.id))
const note = computed(() => notes.value.find((item) => item.id === noteId.value))

useSeoMeta({ title: () => `${note.value?.title || "Note"} · Fieldnote` })

watchEffect(() => {
  if (isReady.value && !note.value) void navigateTo("/notes")
})

const remove = async () => {
  if (!note.value) return
  const accepted = window.confirm("Move this note to the deleted state? This removes it from your notebook.")
  if (!accepted) return
  await deleteNote(note.value.id)
  await navigateTo(note.value.archivedAt ? "/archive" : "/notes")
}
</script>

<template>
  <div class="page note-page">
    <NoteEditor
      v-if="note"
      :note="note"
      @save="updateNote(note.id, $event)"
      @archive="changeArchiveState(note.id, true); navigateTo('/notes')"
      @restore="changeArchiveState(note.id, false); navigateTo('/notes')"
      @delete="remove"
      @back="navigateTo(note.archivedAt ? '/archive' : '/notes')"
    />
    <div v-else class="note-loading paper" role="status">
      <span class="mono">TURNING TO THAT PAGE…</span>
    </div>
  </div>
</template>

<style scoped>
.note-page {
  width: min(980px, 100%);
}

.note-loading {
  display: grid;
  min-height: 60dvh;
  place-items: center;
  color: var(--ink-faint);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}
</style>
