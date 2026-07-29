<script setup lang="ts">
import { ArrowRight, Clock3, Feather, Hash, Sparkles } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"

definePageMeta({ middleware: "auth" })
useSeoMeta({
  title: "Capture · Fieldnote",
  description: "Capture a thought and continue from any device.",
})

const route = useRoute()
const session = authClient.useSession()
const { activeNotes, createNote, updateNote, isReady } = useNotes()
const capture = ref("")
const draftId = ref<string | null>(null)
const greeting = ref("Good day")
const captureField = ref<HTMLTextAreaElement | null>(null)
let captureTimer: ReturnType<typeof setTimeout> | null = null

const recentNotes = computed(() => activeNotes.value.slice(0, 5))
const uniqueTagCount = computed(() => new Set(activeNotes.value.flatMap((note) => note.tags)).size)

const saveCapture = async () => {
  const text = capture.value
  if (!text.trim()) return

  if (!draftId.value) {
    const note = await createNote({ content: text })
    draftId.value = note.id
    return
  }

  await updateNote(draftId.value, { content: text })
}

const queueCapture = () => {
  if (captureTimer) clearTimeout(captureTimer)
  captureTimer = setTimeout(() => void saveCapture(), 450)
}

const openDraft = async () => {
  await saveCapture()
  if (draftId.value) await navigateTo(`/notes/${draftId.value}`)
}

const newPage = async () => {
  const note = await createNote()
  await navigateTo(`/notes/${note.id}`)
}

onMounted(() => {
  const hour = new Date().getHours()
  greeting.value = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  if (route.query.capture === "1") captureField.value?.focus()
})

onBeforeUnmount(() => {
  if (captureTimer) clearTimeout(captureTimer)
  void saveCapture()
})
</script>

<template>
  <div class="page capture-page">
    <header class="capture-hero">
      <div>
        <p class="eyebrow">Your field notebook</p>
        <h1 class="page-title">
          {{ greeting }},
          <em>{{ session.data?.user.name?.split(" ")[0] || "friend" }}.</em>
        </h1>
        <p class="capture-hero__description">Put the thought down before the moment moves on.</p>
      </div>
      <Sparkles :size="44" aria-hidden="true" />
    </header>

    <section class="quick-capture paper">
      <div class="quick-capture__label">
        <span class="quick-capture__mark"><Feather :size="20" aria-hidden="true" /></span>
        <span>
          <strong>Quick capture</strong>
          <small class="mono">AUTOSAVES AS YOU TYPE</small>
        </span>
      </div>
      <label class="sr-only" for="quick-capture">Capture a note</label>
      <textarea
        id="quick-capture"
        ref="captureField"
        v-model="capture"
        placeholder="What needs remembering?"
        @input="queueCapture"
        @keydown.meta.enter.prevent="openDraft"
        @keydown.ctrl.enter.prevent="openDraft"
        @blur="saveCapture"
      />
      <footer>
        <span class="mono">{{ draftId ? "Saved locally" : "Start typing to create a note" }}</span>
        <button class="button button--primary" type="button" :disabled="!capture.trim()" @click="openDraft">
          Open full page
          <ArrowRight :size="16" aria-hidden="true" />
        </button>
      </footer>
    </section>

    <div class="capture-grid">
      <section class="recent">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Keep going</p>
            <h2>Recently touched</h2>
          </div>
          <NuxtLink class="button button--quiet" to="/notes">View all</NuxtLink>
        </div>
        <NoteList v-if="recentNotes.length" :notes="recentNotes" />
        <EmptyState
          v-else-if="isReady"
          title="Your first page is ready."
          description="Start with a meeting, a question, or the sentence you do not want to lose."
          action-label="Open a new page"
          @action="newPage"
        />
      </section>

      <aside class="notebook-glance">
        <p class="eyebrow">At a glance</p>
        <div class="glance-stat">
          <Clock3 :size="18" aria-hidden="true" />
          <strong>{{ activeNotes.length }}</strong>
          <span class="mono">ACTIVE NOTES</span>
        </div>
        <div class="glance-stat">
          <Hash :size="18" aria-hidden="true" />
          <strong>{{ uniqueTagCount }}</strong>
          <span class="mono">THREADS</span>
        </div>
        <p class="notebook-glance__thought">
          “The palest ink is better than the best memory.”
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.capture-page {
  padding-top: clamp(1rem, 3vw, 3rem);
}

.capture-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.capture-hero h1 {
  max-width: 880px;
}

.capture-hero h1 em {
  color: var(--accent);
  font-weight: 400;
}

.capture-hero > svg {
  flex: 0 0 auto;
  margin-bottom: 0.4rem;
  color: var(--olive);
  transform: rotate(8deg);
}

.capture-hero__description {
  margin: 1rem 0 0;
  color: var(--ink-soft);
}

.quick-capture {
  position: relative;
  overflow: hidden;
  margin-bottom: 3.5rem;
  padding: clamp(1.2rem, 4vw, 2rem);
}

.quick-capture::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 5px;
  background: var(--accent);
  content: "";
}

.quick-capture__label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quick-capture__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
}

.quick-capture__label > span:last-child {
  display: grid;
}

.quick-capture__label small {
  margin-top: 0.15rem;
  color: var(--ink-faint);
  font-size: 0.58rem;
  letter-spacing: 0.1em;
}

.quick-capture textarea {
  display: block;
  min-height: 150px;
  width: 100%;
  resize: vertical;
  border: 0;
  padding: 1.5rem 0;
  background: transparent;
  color: var(--ink);
  font-size: clamp(1.3rem, 3vw, 2rem);
  line-height: 1.5;
}

.quick-capture textarea:focus {
  outline: 0;
}

.quick-capture textarea::placeholder {
  color: var(--ink-faint);
}

.quick-capture footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1rem;
}

.quick-capture footer > span {
  color: var(--ink-faint);
  font-size: 0.62rem;
}

.capture-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: clamp(2rem, 5vw, 4rem);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading h2 {
  margin: 0.25rem 0 0;
  font-size: 1.7rem;
  letter-spacing: -0.03em;
}

.notebook-glance {
  border-top: 1px solid var(--line-strong);
  padding-top: 1rem;
}

.glance-stat {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--line);
  padding: 1.1rem 0;
  color: var(--olive);
}

.glance-stat strong {
  color: var(--ink);
  font-size: 2rem;
  line-height: 1;
  text-align: right;
}

.glance-stat span {
  grid-column: 1 / -1;
  color: var(--ink-faint);
  font-size: 0.59rem;
  letter-spacing: 0.1em;
}

.notebook-glance__thought {
  margin: 1.5rem 0 0;
  color: var(--ink-soft);
  font-style: italic;
}

@media (max-width: 760px) {
  .capture-hero > svg {
    display: none;
  }

  .capture-grid {
    grid-template-columns: 1fr;
  }

  .notebook-glance {
    display: none;
  }

  .quick-capture footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .quick-capture footer .button {
    width: 100%;
  }
}
</style>
