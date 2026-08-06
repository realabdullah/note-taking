<script setup lang="ts">
import { Archive, ArrowLeft, Bold, Code2, Heading2, List, Maximize2, Minimize2, Redo2, RotateCcw, Share2, Trash2, Undo2 } from "@lucide/vue"
import { EditorContent, useEditor } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import type { Note } from "~~/shared/types/note"

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{
  save: [value: { title: string; content: string; tagNames: string[] }]
  archive: []
  restore: []
  delete: []
  share: []
  back: []
}>()

const title = ref(props.note.title)
const tagsInput = ref(props.note.tags.join(", "))
const isFocusMode = ref(false)
const content = ref(props.note.content)
let saveTimer: ReturnType<typeof setTimeout> | null = null

const editor = useEditor({
  content: props.note.content,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: "editor__content",
      "aria-label": "Note content",
      "data-placeholder": "Start where your attention is…",
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    content.value = currentEditor.getHTML()
    queueSave()
  },
})

const tags = computed(() =>
  tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
)
const hasChanges = computed(() =>
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
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 700)
}

const focusEditor = () => nextTick(() => editor.value?.commands.focus())
const exitFocusMode = () => {
  isFocusMode.value = false
  focusEditor()
}
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
  focusEditor()
}
const handleBack = () => {
  flush()
  emit("back")
}
const handleShare = () => {
  flush()
  emit("share")
}
const onGlobalKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") {
    event.preventDefault()
    toggleFocusMode()
  }
  if (event.key === "Escape" && isFocusMode.value) {
    event.preventDefault()
    exitFocusMode()
  }
}
const onVisibilityChange = () => {
  if (document.visibilityState === "hidden") flush()
}

// The component is keyed by note ID, so navigation creates a fresh editor for
// the next note. Do not mirror same-note cache/server updates back into this
// draft: setContent would reset the rich-text selection and can overwrite text
// entered while a previous save is still in flight.

onMounted(() => {
  focusEditor()
  window.addEventListener("keydown", onGlobalKeydown)
  document.addEventListener("visibilitychange", onVisibilityChange)
})
onBeforeUnmount(() => {
  flush()
  window.removeEventListener("keydown", onGlobalKeydown)
  document.removeEventListener("visibilitychange", onVisibilityChange)
  editor.value?.destroy()
})
</script>

<template>
  <article class="editor paper" :class="{ 'editor--focus': isFocusMode }">
    <header class="editor__top">
      <button class="editor__back" type="button" @click="handleBack"><ArrowLeft :size="17" aria-hidden="true" /><span>Notes</span></button>
      <SyncIndicator compact />
      <span class="editor__updated mono">{{ note.syncState === "local" ? "Saved on this device" : "Autosaved" }}</span>
      <div class="editor__actions">
        <button class="editor__icon-button editor__focus-button" type="button" :aria-label="isFocusMode ? 'Exit focus mode' : 'Enter focus mode'" :aria-pressed="isFocusMode" :title="isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode (⌘⇧F)'" @click="toggleFocusMode"><Minimize2 v-if="isFocusMode" :size="17" aria-hidden="true" /><Maximize2 v-else :size="17" aria-hidden="true" /></button>
        <button class="editor__icon-button" type="button" aria-label="Share note" @click="handleShare"><Share2 :size="17" aria-hidden="true" /></button>
        <button class="editor__icon-button" type="button" :aria-label="note.archivedAt ? 'Restore note' : 'Archive note'" @click="note.archivedAt ? $emit('restore') : $emit('archive')"><RotateCcw v-if="note.archivedAt" :size="17" aria-hidden="true" /><Archive v-else :size="17" aria-hidden="true" /></button>
        <button class="editor__icon-button editor__icon-button--danger" type="button" aria-label="Delete note" @click="$emit('delete')"><Trash2 :size="17" aria-hidden="true" /></button>
      </div>
    </header>

    <div class="editor__page">
      <label class="sr-only" :for="`title-${note.id}`">Note title</label>
      <input :id="`title-${note.id}`" v-model="title" class="editor__title" type="text" maxlength="240" placeholder="Untitled note" @input="queueSave" @blur="flush" />
      <div class="editor__rule">
        <span class="mono">{{ new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(note.createdAt)) }}</span><span aria-hidden="true">✦</span>
        <label class="editor__tags-label"><span class="sr-only">Tags separated by commas</span><input v-model="tagsInput" class="editor__tags" type="text" placeholder="tags, separated, by commas" @input="queueSave" @blur="flush" /></label>
      </div>
      <div class="editor__toolbar" aria-label="Text formatting">
        <button type="button" aria-label="Undo" :disabled="!editor?.can().undo()" @mousedown.prevent @click="editor?.chain().focus().undo().run()"><Undo2 :size="16" aria-hidden="true" /></button>
        <button type="button" aria-label="Redo" :disabled="!editor?.can().redo()" @mousedown.prevent @click="editor?.chain().focus().redo().run()"><Redo2 :size="16" aria-hidden="true" /></button>
        <span class="editor__toolbar-divider" aria-hidden="true" />
        <button type="button" aria-label="Heading" :aria-pressed="editor?.isActive('heading', { level: 2 })" @mousedown.prevent @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"><Heading2 :size="16" aria-hidden="true" /></button>
        <button type="button" aria-label="Bold" :aria-pressed="editor?.isActive('bold')" @mousedown.prevent @click="editor?.chain().focus().toggleBold().run()"><Bold :size="16" aria-hidden="true" /></button>
        <button type="button" aria-label="Bullet list" :aria-pressed="editor?.isActive('bulletList')" @mousedown.prevent @click="editor?.chain().focus().toggleBulletList().run()"><List :size="16" aria-hidden="true" /></button>
        <button type="button" aria-label="Code block" :aria-pressed="editor?.isActive('codeBlock')" @mousedown.prevent @click="editor?.chain().focus().toggleCodeBlock().run()"><Code2 :size="16" aria-hidden="true" /></button>
        <span class="mono">Rich text · ⌘⇧F to focus</span>
      </div>
      <EditorContent :editor="editor" />
    </div>
  </article>
</template>

<style scoped>
.editor { min-height: calc(100dvh - 2rem); overflow: hidden; }
.editor--focus { position: fixed; z-index: 60; inset: 0; display: flex; width: 100%; min-height: 100dvh; flex-direction: column; overflow: auto; border-radius: 0; background: var(--paper); }
.editor__top { display: grid; min-height: 64px; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .75rem; border-bottom: 1px solid var(--line); padding: .7rem 1.25rem; }
.editor--focus .editor__top { position: sticky; z-index: 1; top: 0; background: var(--paper); }
.editor__back { display: flex; min-height: 40px; align-items: center; gap: .4rem; border: 0; background: transparent; color: var(--ink-soft); font-family: var(--font-mono); font-size: .7rem; }
.editor__updated { color: var(--ink-faint); font-size: .64rem; }
.editor__actions { display: flex; align-items: center; gap: .25rem; }
.editor__icon-button, .editor__toolbar button { display: grid; place-items: center; border: 0; background: transparent; color: var(--ink-soft); transition: background-color var(--motion-fast) var(--ease-out-quick), color var(--motion-fast) var(--ease-out-quick), transform 80ms var(--ease-out-quick); }
.editor__icon-button { width: 40px; height: 40px; border-radius: 50%; }
.editor__icon-button:hover, .editor__toolbar button:hover, .editor__toolbar button[aria-pressed="true"] { background: var(--paper-deep); color: var(--ink); }
.editor__icon-button--danger:hover { color: var(--danger); }
.editor__icon-button:active, .editor__toolbar button:active { transform: scale(.96); }
.editor__page { width: min(1000px, 100%); margin: 0 auto; padding: clamp(2rem, 5vw, 3.5rem) clamp(1.2rem, 5vw, 4.5rem) 5rem; }
.editor__title { width: 100%; border: 0; padding: 0; background: transparent; color: var(--ink); font-size: clamp(2.2rem, 6vw, 4.7rem); font-weight: 600; letter-spacing: -.04em; line-height: 1; text-wrap: balance; }
.editor__title:focus, .editor__tags:focus { outline: 0; }.editor__title::placeholder { color: color-mix(in srgb, var(--ink-faint) 62%, transparent); }
.editor__rule { position: relative; display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: .75rem; align-items: center; border-top: 1px solid var(--line-strong); margin: 1.35rem 0 0; padding: .65rem 0; color: var(--ink-faint); font-size: .66rem; }
.editor__tags-label { min-width: 0; }.editor__tags { width: 100%; border: 0; padding: 0; background: transparent; color: var(--olive); font-family: var(--font-mono); font-size: .66rem; }
.editor__toolbar { display: flex; align-items: center; gap: .25rem; margin: 1rem 0 .5rem; color: var(--ink-faint); }.editor__toolbar button { width: 34px; height: 34px; border-radius: 7px; }.editor__toolbar button:disabled { cursor: not-allowed; opacity: .35; }.editor__toolbar-divider { width: 1px; height: 20px; margin: 0 .25rem; background: var(--line); }.editor__toolbar > .mono:last-child { margin-left: auto; font-size: .59rem; }
:deep(.editor__content) { display: block; min-height: 58dvh; width: 100%; padding: 1rem 0; color: var(--ink); font-size: clamp(1.03rem, 1.25vw, 1.14rem); line-height: 1.72; outline: 0; }
:deep(.editor__content p.is-editor-empty:first-child::before) { float: left; height: 0; color: var(--ink-faint); content: attr(data-placeholder); pointer-events: none; }
:deep(.editor__content h2) { margin: 1.6em 0 .5em; font-size: 1.55em; line-height: 1.2; }:deep(.editor__content p) { margin: 0 0 1em; }:deep(.editor__content ul) { margin: 0 0 1em; padding-left: 1.4em; }:deep(.editor__content pre) { overflow-x: auto; border-radius: var(--radius-sm); padding: 1rem; background: var(--paper-deep); font-family: var(--font-mono); font-size: .86em; }
.editor--focus .editor__page { width: min(1000px, calc(100% - 2rem)); padding-top: clamp(3rem, 8vh, 6rem); }.editor--focus :deep(.editor__content) { min-height: calc(100dvh - 15rem); }.editor__focus-button[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent-strong); }
@media (max-width: 640px) { .editor { min-height: calc(100dvh - 6.5rem); border-radius: var(--radius-md); }.editor--focus { min-height: 100dvh; border-radius: 0; }.editor__top { grid-template-columns: auto auto 1fr; }.editor__updated, .editor__toolbar > .mono:last-child { display: none; }.editor__actions { justify-self: end; }.editor__rule { grid-template-columns: 1fr; gap: .4rem; }.editor__rule > span:nth-child(2) { display: none; }.editor--focus .editor__page { width: 100%; padding-top: 2.25rem; } }
</style>
