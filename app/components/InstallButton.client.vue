<script setup lang="ts">
import { Check, Download, Info, Share } from "@lucide/vue"

const { compact = false } = defineProps<{ compact?: boolean }>()
const { installed, initialized, installOutcome, isIos, isSafari, canPrompt, install } = usePwaInstall()
const installing = ref(false)

const instruction = computed(() => {
  if (isIos.value) return "In Safari, tap Share, then Add to Home Screen."
  if (isSafari.value) return "In Safari, open File and choose Add to Dock."
  return "Open your browser menu and choose Install Fieldnote or Add to Home Screen."
})

const beginInstall = async () => {
  installing.value = true
  await install()
  installing.value = false
}
</script>

<template>
  <button
    v-if="canPrompt"
    class="install-button"
    type="button"
    :disabled="installing"
    @click="beginInstall"
  >
    <Download :size="15" aria-hidden="true" />
    <span>{{ installing ? "Opening install…" : "Install Fieldnote" }}</span>
  </button>
  <div v-else-if="!compact && installed" class="install-status install-status--success" role="status">
    <Check :size="17" aria-hidden="true" />
    <span>
      <strong>Fieldnote is installed</strong>
      <small>Open it from your home screen, Dock, or application launcher.</small>
    </span>
  </div>
  <div v-else-if="!compact && initialized" class="install-status">
    <Share v-if="isIos || isSafari" :size="17" aria-hidden="true" />
    <Info v-else :size="17" aria-hidden="true" />
    <span>
      <strong>{{ installOutcome === "dismissed" ? "Install dismissed" : "Install from your browser" }}</strong>
      <small>{{ instruction }}</small>
    </span>
  </div>
</template>

<style scoped>
.install-button {
  display: flex;
  min-height: 40px;
  width: 100%;
  align-items: center;
  gap: 0.55rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.7rem;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.install-status {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.7rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm);
  padding: 0.85rem;
  color: var(--ink-soft);
}

.install-status > svg {
  margin-top: 0.15rem;
  color: var(--accent);
}

.install-status span {
  display: grid;
  gap: 0.18rem;
}

.install-status strong {
  color: var(--ink);
  font-size: 0.86rem;
}

.install-status small {
  font-size: 0.76rem;
}

.install-status--success > svg {
  color: var(--success);
}
</style>
