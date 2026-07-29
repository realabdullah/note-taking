<script setup lang="ts">
import { ArrowUpRight, CloudOff, RefreshCw } from "@lucide/vue"
import type { Note } from "~~/shared/types/note"
import { deriveNoteTitle, notePreview } from "~~/shared/utils/note"

defineProps<{ notes: Note[]; selectedId?: string }>()
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true
})

const formatRelativeTime = (value: string) => {
  const elapsed = Date.now() - Date.parse(value)
  const minutes = Math.max(1, Math.floor(elapsed / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value))
}

const formatStableDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value))

const displayTime = (value: string) => (hydrated.value ? formatRelativeTime(value) : formatStableDate(value))
</script>

<template>
  <div class="note-list">
    <NuxtLink
      v-for="(note, index) in notes"
      :key="note.id"
      :to="`/notes/${note.id}`"
      class="note-row"
      :class="{ 'note-row--selected': selectedId === note.id }"
      :style="{ '--delay': `${Math.min(index, 10) * 32}ms` }"
    >
      <span class="note-row__number mono">{{ String(index + 1).padStart(2, "0") }}</span>
      <span class="note-row__body">
        <span class="note-row__title">{{ deriveNoteTitle(note.title, note.content) }}</span>
        <span class="note-row__preview">{{ notePreview(note.content) || "A blank page, waiting." }}</span>
        <span v-if="note.tags.length" class="note-row__tags">
          <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="mono">#{{ tag }}</span>
        </span>
      </span>
      <span class="note-row__meta mono">
        <span>{{ displayTime(note.updatedAt) }}</span>
        <CloudOff v-if="note.syncState === 'local'" :size="13" aria-label="Saved locally" />
        <RefreshCw
          v-else-if="note.syncState === 'pending' || note.syncState === 'syncing'"
          :size="13"
          aria-label="Waiting to sync"
        />
        <ArrowUpRight v-else :size="15" aria-hidden="true" />
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.note-list {
  overflow: hidden;
  border-top: 1px solid var(--line-strong);
}

.note-row {
  display: grid;
  min-height: 116px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  border-bottom: 1px solid var(--line);
  padding: 1.15rem 0.25rem;
  animation: row-in 420ms both;
  animation-delay: var(--delay);
  transition:
    padding 180ms ease,
    background 180ms ease;
}

.note-row:hover,
.note-row--selected {
  padding-right: 0.8rem;
  padding-left: 0.8rem;
  background: color-mix(in srgb, var(--paper-raised) 72%, transparent);
}

.note-row--selected {
  box-shadow: inset 3px 0 var(--accent);
}

.note-row__number {
  padding-top: 0.2rem;
  color: var(--ink-faint);
  font-size: 0.65rem;
}

.note-row__body {
  display: grid;
  min-width: 0;
}

.note-row__title {
  overflow: hidden;
  font-size: 1.12rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-row__preview {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.25rem;
  color: var(--ink-soft);
  font-size: 0.88rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.note-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.55rem;
  color: var(--olive);
  font-size: 0.62rem;
}

.note-row__meta {
  display: flex;
  min-width: 48px;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  padding-top: 0.2rem;
  color: var(--ink-faint);
  font-size: 0.63rem;
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (max-width: 560px) {
  .note-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .note-row__number {
    display: none;
  }
}
</style>
