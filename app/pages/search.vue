<script setup lang="ts">
import { Search, X } from "@lucide/vue"
import { deriveNoteTitle } from "~~/shared/utils/note"

definePageMeta({ middleware: "auth" })
useSeoMeta({ title: "Search · Fieldnote" })

const route = useRoute()
const router = useRouter()
const { notes } = useNotes()
const query = ref(typeof route.query.q === "string" ? route.query.q : "")
const input = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return []

  return notes.value.filter((note) =>
    [note.title, note.content, ...note.tags].some((value) => value.toLowerCase().includes(normalized)),
  )
})

watch(query, (value) => {
  void router.replace({ query: value.trim() ? { q: value } : {} })
})

onMounted(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.setTimeout(() => input.value?.focus(), reduceMotion ? 0 : 70)
})
</script>

<template>
  <div class="page search-page">
    <p class="eyebrow">Find the thread</p>
    <div class="search-box">
      <Search :size="27" aria-hidden="true" />
      <label class="sr-only" for="search-notes">Search notes</label>
      <input
        id="search-notes"
        ref="input"
        v-model="query"
        type="search"
        placeholder="Search every page…"
        @keydown.esc.prevent="query = ''"
      />
      <button v-if="query" type="button" aria-label="Clear search" @click="query = ''">
        <X :size="18" aria-hidden="true" />
      </button>
      <kbd>ESC</kbd>
    </div>

    <p v-if="query" class="search-summary mono">
      {{ results.length }} {{ results.length === 1 ? "PAGE" : "PAGES" }} MATCH “{{ query.toUpperCase() }}”
    </p>

    <NoteList v-if="results.length" :notes="results" />
    <EmptyState
      v-else
      :title="query ? `No page mentions “${query}”` : 'Search the whole notebook.'"
      :description="
        query ? 'Try fewer words, a tag, or another phrase.' : 'Titles, writing, and tags are all part of the search.'
      "
    />

    <div v-if="results.length" class="search-index" aria-hidden="true">
      <span v-for="note in results.slice(0, 6)" :key="note.id">{{
        deriveNoteTitle(note.title, note.content).slice(0, 1)
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  position: relative;
  padding-top: clamp(1rem, 6vw, 5rem);
}

.search-box {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  border-bottom: 2px solid var(--ink);
  margin: 0.5rem 0 1rem;
  padding: 0.7rem 0;
  transform-origin: center left;
  animation: search-settle 120ms var(--ease-out-quick) both;
}

.search-box input {
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ink);
  font-size: clamp(2rem, 7vw, 5rem);
  letter-spacing: -0.055em;
}

.search-box input:focus {
  outline: 0;
}

.search-box input::placeholder {
  color: var(--ink-faint);
}

.search-box button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--paper-deep);
}

.search-summary {
  margin: 0 0 2rem;
  color: var(--ink-faint);
  font-size: 0.63rem;
  letter-spacing: 0.08em;
}

.search-index {
  position: fixed;
  right: 1.2rem;
  bottom: 1.2rem;
  display: flex;
  gap: 0.25rem;
}

.search-index span {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 0.6rem;
}

.search-page :deep(.empty-state) {
  animation: search-helper-settle 120ms var(--ease-out-quick) 40ms both;
}

.search-page :deep(.empty-state__mark) {
  animation: quill-float 4.5s var(--ease-in-out-soft) infinite;
}

@keyframes search-settle {
  from {
    opacity: 0;
    transform: scale(0.99);
  }
}

@keyframes search-helper-settle {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
}

@keyframes quill-float {
  50% {
    transform: translateY(-2px);
  }
}
</style>
