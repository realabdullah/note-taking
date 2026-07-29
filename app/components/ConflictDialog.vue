<script setup lang="ts">
import { Copy, GitMerge, X } from "@lucide/vue"

const { conflicts, resolveConflict } = useNotes()
const active = computed(() => conflicts.value[0] ?? null)
const copied = ref(false)

const copyLocal = async () => {
  if (!active.value) return
  await navigator.clipboard.writeText(active.value.revision.content)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="active" class="conflict-backdrop" role="presentation">
      <section
        class="conflict-dialog paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-title"
        aria-describedby="conflict-description"
      >
        <div class="conflict-dialog__icon"><GitMerge :size="23" aria-hidden="true" /></div>
        <p class="eyebrow">Two devices, one note</p>
        <h2 id="conflict-title">Choose what stays on the page.</h2>
        <p id="conflict-description">
          This note changed elsewhere while you were editing. Both versions are safe until you choose.
        </p>

        <div class="conflict-versions">
          <article>
            <span class="mono">SERVER VERSION</span>
            <strong>{{ active.note.title || "Untitled note" }}</strong>
            <p>{{ active.note.content.slice(0, 180) || "Blank note" }}</p>
          </article>
          <article>
            <span class="mono">THIS DEVICE</span>
            <strong>{{ active.revision.title || "Untitled note" }}</strong>
            <p>{{ active.revision.content.slice(0, 180) || "Blank note" }}</p>
          </article>
        </div>

        <div class="conflict-dialog__actions">
          <button class="button button--quiet" type="button" @click="copyLocal">
            <Copy :size="15" aria-hidden="true" />
            {{ copied ? "Copied" : "Copy local text" }}
          </button>
          <button class="button button--quiet" type="button" @click="resolveConflict(active.id, 'server')">
            Keep server
          </button>
          <button class="button button--primary" type="button" @click="resolveConflict(active.id, 'local')">
            Keep this device
          </button>
        </div>
        <button
          class="conflict-dialog__close"
          type="button"
          aria-label="Leave conflict for later"
          @click="conflicts.shift()"
        >
          <X :size="18" aria-hidden="true" />
        </button>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.conflict-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(8, 11, 9, 0.62);
  backdrop-filter: blur(7px);
}

.conflict-dialog {
  position: relative;
  width: min(680px, 100%);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  padding: clamp(1.5rem, 5vw, 3rem);
}

.conflict-dialog__icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
}

.conflict-dialog h2 {
  margin: 0.45rem 0;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.conflict-dialog > p:not(.eyebrow) {
  color: var(--ink-soft);
}

.conflict-versions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.conflict-versions article {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: var(--paper);
}

.conflict-versions span {
  color: var(--ink-faint);
  font-size: 0.58rem;
}

.conflict-versions strong {
  display: block;
  margin: 0.45rem 0;
}

.conflict-versions p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.conflict-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.conflict-dialog__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
}

@media (max-width: 580px) {
  .conflict-versions {
    grid-template-columns: 1fr;
  }

  .conflict-dialog__actions {
    display: grid;
  }
}
</style>
