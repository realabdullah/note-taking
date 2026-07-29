<script setup lang="ts">
import {
  Archive,
  ArrowLeft,
  Bold,
  CheckSquare,
  Code2,
  Heading2,
  List,
  RotateCcw,
  Trash2,
} from "@lucide/vue"
import type { Note } from "~~/shared/types/note"

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{
  save: [value: { title: string; content: string; tagNames: string[] }]
  archive: []
  restore: []
  delete: []
  back: []
}>()

const title = ref(props.note.title)
const content = ref(props.note.content)
const tagsInput = ref(props.note.tags.join(", "))
const editor = ref<HTMLTextAreaElement | null>(null)
const isEditing = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null

const tags = computed(() =>
  tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
)

const hasChanges = computed(
  () =>
    title.value !== props.note.title ||
    content.value !== props.note.content ||
    tags.value.join("|") !== props.note.tags.join("|"),
)

const flush = () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  if (!hasChanges.value) return
  emit("save", { title: title.value, content: content.value, tagNames: tags.value })
}

const queueSave = () => {
  isEditing.value = true
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 700)
}

const insertMarkdown = (before: string, after = "", placeholder = "") => {
  const element = editor.value
  if (!element) return

  const start = element.selectionStart
  const end = element.selectionEnd
  const selected = content.value.slice(start, end) || placeholder
  content.value = `${content.value.slice(0, start)}${before}${selected}${after}${content.value.slice(end)}`
  queueSave()

  nextTick(() => {
    element.focus()
    const cursorStart = start + before.length
    element.setSelectionRange(cursorStart, cursorStart + selected.length)
  })
}

const onEditorKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    flush()
    emit("back")
    return
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
    event.preventDefault()
    insertMarkdown("**", "**", "bold text")
  }
}

watch(
  () => props.note,
  (note, previousNote) => {
    // A sync response can replace the parent note while the user is still
    // typing. Keep the draft in the editor until the response acknowledges it.
    // A note-id change is navigation, so it must always load the new note.
    if (previousNote?.id === note.id && isEditing.value && hasChanges.value) return

    title.value = note.title
    content.value = note.content
    tagsInput.value = note.tags.join(", ")
    isEditing.value = false
  },
)

onMounted(() => {
  editor.value?.focus()
  const onVisibility = () => {
    if (document.visibilityState === "hidden") flush()
  }
  document.addEventListener("visibilitychange", onVisibility)
  onBeforeUnmount(() => document.removeEventListener("visibilitychange", onVisibility))
})

onBeforeUnmount(flush)
</script>

<template>
  <article class="editor paper">
    <header class="editor__top">
      <button class="editor__back" type="button" @click="flush(); $emit('back')">
        <ArrowLeft :size="17" aria-hidden="true" />
        <span>Notes</span>
      </button>
      <SyncIndicator compact />
      <span class="editor__updated mono">
        {{ note.syncState === "local" ? "Saved on this device" : note.syncState === "conflict" ? "Conflict" : "Autosaved" }}
      </span>
      <div class="editor__actions">
        <button
          class="editor__icon-button"
          type="button"
          :aria-label="note.archivedAt ? 'Restore note' : 'Archive note'"
          @click="note.archivedAt ? $emit('restore') : $emit('archive')"
        >
          <RotateCcw v-if="note.archivedAt" :size="17" aria-hidden="true" />
          <Archive v-else :size="17" aria-hidden="true" />
        </button>
        <button class="editor__icon-button editor__icon-button--danger" type="button" aria-label="Delete note" @click="$emit('delete')">
          <Trash2 :size="17" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="editor__page">
      <label class="sr-only" :for="`title-${note.id}`">Note title</label>
      <input
        :id="`title-${note.id}`"
        v-model="title"
        class="editor__title"
        type="text"
        maxlength="240"
        placeholder="Untitled note"
        @input="queueSave"
        @blur="flush"
      />

      <div class="editor__rule">
        <span class="mono">{{ new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(note.createdAt)) }}</span>
        <span aria-hidden="true">✦</span>
        <label class="editor__tags-label">
          <span class="sr-only">Tags separated by commas</span>
          <input
            v-model="tagsInput"
            class="editor__tags"
            type="text"
            placeholder="tags, separated, by commas"
            @input="queueSave"
            @blur="flush"
          />
        </label>
      </div>

      <div class="editor__toolbar" aria-label="Markdown formatting">
        <button type="button" aria-label="Heading" @click="insertMarkdown('## ', '', 'Heading')">
          <Heading2 :size="16" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Bold" @click="insertMarkdown('**', '**', 'bold text')">
          <Bold :size="16" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Bullet list" @click="insertMarkdown('- ', '', 'List item')">
          <List :size="16" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Checklist" @click="insertMarkdown('- [ ] ', '', 'Task')">
          <CheckSquare :size="16" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Inline code" @click="insertMarkdown('`', '`', 'code')">
          <Code2 :size="16" aria-hidden="true" />
        </button>
        <span class="mono">Markdown shortcuts</span>
      </div>

      <label class="sr-only" :for="`content-${note.id}`">Note content</label>
      <textarea
        :id="`content-${note.id}`"
        ref="editor"
        v-model="content"
        class="editor__content"
        placeholder="Start where your attention is…"
        spellcheck="true"
        @input="queueSave"
        @blur="flush"
        @keydown="onEditorKeydown"
      />
    </div>
  </article>
</template>

<style scoped>
.editor {
  min-height: calc(100dvh - 4rem);
  overflow: hidden;
}

.editor__top {
  display: grid;
  min-height: 64px;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--line);
  padding: 0.7rem 1rem;
}

.editor__back {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.editor__updated {
  color: var(--ink-faint);
  font-size: 0.64rem;
}

.editor__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.editor__icon-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
}

.editor__icon-button:hover {
  background: var(--paper-deep);
  color: var(--ink);
}

.editor__icon-button--danger:hover {
  color: var(--danger);
}

.editor__page {
  width: min(780px, 100%);
  margin: 0 auto;
  padding: clamp(2rem, 7vw, 5.5rem) clamp(1.2rem, 6vw, 4.5rem) 6rem;
}

.editor__title {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ink);
  font-size: clamp(2.2rem, 7vw, 4.7rem);
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 1;
}

.editor__title:focus {
  outline: 0;
}

.editor__title::placeholder {
  color: color-mix(in srgb, var(--ink-faint) 62%, transparent);
}

.editor__rule {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  border-top: 1px solid var(--line-strong);
  border-bottom: 1px solid var(--line);
  margin: 2rem 0 0;
  padding: 0.75rem 0;
  color: var(--ink-faint);
  font-size: 0.66rem;
}

.editor__tags-label {
  min-width: 0;
}

.editor__tags {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--olive);
  font-family: var(--font-mono);
  font-size: 0.66rem;
}

.editor__tags:focus {
  outline: 0;
}

.editor__toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 1rem 0 0.5rem;
  color: var(--ink-faint);
}

.editor__toolbar button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-soft);
}

.editor__toolbar button:hover {
  background: var(--paper-deep);
  color: var(--ink);
}

.editor__toolbar span {
  margin-left: auto;
  font-size: 0.59rem;
}

.editor__content {
  display: block;
  min-height: 54dvh;
  width: 100%;
  resize: none;
  border: 0;
  padding: 1rem 0;
  background: transparent;
  color: var(--ink);
  font-size: clamp(1.03rem, 2vw, 1.18rem);
  line-height: 1.8;
}

.editor__content:focus {
  outline: 0;
}

.editor__content::placeholder {
  color: var(--ink-faint);
}

@media (max-width: 640px) {
  .editor {
    min-height: calc(100dvh - 6.5rem);
    border-radius: var(--radius-md);
  }

  .editor__top {
    grid-template-columns: auto auto 1fr;
  }

  .editor__updated {
    display: none;
  }

  .editor__actions {
    justify-self: end;
  }

  .editor__rule {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }

  .editor__rule > span:nth-child(2) {
    display: none;
  }

  .editor__toolbar span {
    display: none;
  }
}
</style>
