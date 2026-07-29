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
  <TransitionGroup name="note-row" tag="div" class="note-list" appear>
    <NuxtLink
      v-for="(note, index) in notes"
      :key="note.id"
      :to="`/notes/${note.id}`"
      class="note-row"
      :class="{ 'note-row--selected': selectedId === note.id }"
      :style="{ '--row-delay': `${Math.min(index, 4) * 24}ms` }"
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
  </TransitionGroup>
</template>

<style scoped>
.note-list {
  overflow: hidden;
  border-top: 1px solid var(--line-strong);
}

.note-row {
  display: grid;
  overflow: hidden;
  min-height: 116px;
  max-height: 180px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  border-bottom: 1px solid var(--line);
  padding: 1.15rem 0.25rem;
  transition:
    padding var(--motion-fast) var(--ease-out-quick),
    background-color var(--motion-fast) var(--ease-out-quick);
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
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
  transition: opacity var(--motion-fast) var(--ease-out-quick);
}

.note-row__meta svg {
  opacity: 0.45;
  transform: translateX(-2px);
  transition:
    opacity var(--motion-fast) var(--ease-out-quick),
    transform var(--motion-fast) var(--ease-out-quick);
}

.note-row:hover .note-row__meta,
.note-row:hover .note-row__meta svg,
.note-row--selected .note-row__meta,
.note-row--selected .note-row__meta svg {
  opacity: 1;
}

.note-row:hover .note-row__meta svg,
.note-row--selected .note-row__meta svg {
  transform: translateX(0);
}

.note-row-enter-active {
  transition:
    min-height 140ms var(--ease-out-quick) var(--row-delay),
    max-height 140ms var(--ease-out-quick) var(--row-delay),
    padding 140ms var(--ease-out-quick) var(--row-delay),
    opacity 120ms var(--ease-out-quick) var(--row-delay);
}

.note-row-leave-active {
  transition:
    min-height 300ms var(--ease-in-out-soft),
    max-height 300ms var(--ease-in-out-soft),
    padding 300ms var(--ease-in-out-soft),
    opacity 180ms var(--ease-in-out-soft);
}

.note-row-move {
  transition: transform 280ms var(--ease-in-out-soft);
}

.note-row-enter-from,
.note-row-leave-to {
  min-height: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
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
