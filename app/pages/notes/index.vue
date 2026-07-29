<script setup lang="ts">
import { Plus } from "@lucide/vue"

definePageMeta({ middleware: "auth" })
useSeoMeta({ title: "All notes · Fieldnote" })

const { activeNotes, createNote, isReady } = useNotes()
const selectedTag = ref("")
const allTags = computed(() => [...new Set(activeNotes.value.flatMap((note) => note.tags))].sort())
const visibleNotes = computed(() =>
  selectedTag.value
    ? activeNotes.value.filter((note) => note.tags.some((tag) => tag.toLowerCase() === selectedTag.value.toLowerCase()))
    : activeNotes.value,
)

const create = async () => {
  const note = await createNote()
  await navigateTo(`/notes/${note.id}`)
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__copy">
        <p class="eyebrow">Your notebook</p>
        <h1 class="page-title">All notes.</h1>
        <p class="page-header__description">The latest pages rise to the top. Search when memory needs a hand.</p>
      </div>
      <button class="button button--primary" type="button" @click="create">
        <Plus :size="17" aria-hidden="true" />
        New note
      </button>
    </header>

    <div v-if="allTags.length" class="tag-filter" aria-label="Filter notes by tag">
      <TagChip label="Everything" :active="!selectedTag" @click="selectedTag = ''" />
      <TagChip
        v-for="tag in allTags"
        :key="tag"
        :label="tag"
        :active="selectedTag === tag"
        @click="selectedTag = tag"
      />
    </div>

    <NoteList v-if="visibleNotes.length" :notes="visibleNotes" />
    <EmptyState
      v-else-if="isReady"
      :title="selectedTag ? `Nothing tagged “${selectedTag}”` : 'A clean first page.'"
      :description="selectedTag ? 'Try another thread or return to everything.' : 'Capture the first thing that deserves a place outside your head.'"
      :action-label="selectedTag ? undefined : 'Capture a note'"
      @action="create"
    />
  </div>
</template>

<style scoped>
.tag-filter {
  display: flex;
  overflow-x: auto;
  gap: 0.45rem;
  margin: -0.5rem 0 2rem;
  padding-bottom: 0.35rem;
  scrollbar-width: none;
}

.tag-filter::-webkit-scrollbar {
  display: none;
}
</style>
