<script setup lang="ts">
import { CloudOff, TriangleAlert } from "@lucide/vue"

defineProps<{ compact?: boolean }>()

type SyncTone = "saved" | "syncing" | "offline" | "error"

const { isOnline } = useConnection()
const { isSyncing, syncError, lastSyncedAt } = useNotes()
const hydrated = ref(false)
const visibleTone = ref<SyncTone>("saved")
const visibleLabel = ref("Ready to sync")
const drawCheck = ref(false)
let syncingSince = 0
let settleTimer: ReturnType<typeof setTimeout> | null = null
let drawTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  hydrated.value = true
})

const actualStatus = computed<{ label: string; tone: SyncTone }>(() => {
  // Keep the first client render identical to SSR. The sync plugin can start
  // before hydration completes and would otherwise swap the status.
  if (!hydrated.value) return { label: "Ready to sync", tone: "saved" }
  if (!isOnline.value) return { label: "Offline · saved locally", tone: "offline" }
  if (isSyncing.value) return { label: "Syncing changes", tone: "syncing" }
  if (syncError.value) return { label: syncError.value, tone: "error" }
  return {
    label: lastSyncedAt.value ? "All changes saved" : "Ready to sync",
    tone: "saved",
  }
})

const applyVisibleStatus = (tone: SyncTone, label: string, shouldDraw = false) => {
  visibleTone.value = tone
  visibleLabel.value = label
  drawCheck.value = shouldDraw

  if (drawTimer) clearTimeout(drawTimer)
  if (shouldDraw) {
    drawTimer = setTimeout(() => {
      drawCheck.value = false
    }, 320)
  }
}

watch(
  actualStatus,
  (next) => {
    if (settleTimer) clearTimeout(settleTimer)

    if (next.tone === "syncing") {
      syncingSince = Date.now()
      applyVisibleStatus(next.tone, next.label)
      return
    }

    if (visibleTone.value === "syncing" && next.tone === "saved") {
      const remaining = Math.max(0, 450 - (Date.now() - syncingSince))
      settleTimer = setTimeout(() => applyVisibleStatus(next.tone, next.label, true), remaining)
      return
    }

    applyVisibleStatus(next.tone, next.label)
  },
  { immediate: true },
)

const auxiliaryIcon = computed(() => {
  if (visibleTone.value === "offline") return CloudOff
  if (visibleTone.value === "error") return TriangleAlert
  return null
})

onBeforeUnmount(() => {
  if (settleTimer) clearTimeout(settleTimer)
  if (drawTimer) clearTimeout(drawTimer)
})
</script>

<template>
  <div class="sync-indicator" :class="[`sync-indicator--${visibleTone}`, { 'sync-indicator--compact': compact }]">
    <span class="sync-indicator__icon" aria-hidden="true">
      <svg
        v-if="visibleTone === 'saved' || visibleTone === 'syncing'"
        viewBox="0 0 20 20"
        :class="{ 'sync-indicator__state-icon--draw': drawCheck }"
      >
        <circle class="sync-indicator__spinner" cx="10" cy="10" r="7" />
        <path class="sync-indicator__check" d="m5.5 10.2 3 3 6-6.5" />
      </svg>
      <component :is="auxiliaryIcon" v-else :size="14" />
    </span>

    <Transition v-if="!compact" name="sync-label" mode="out-in">
      <span :key="visibleLabel">{{ visibleLabel }}</span>
    </Transition>
    <span v-else class="sr-only" aria-live="polite">{{ visibleLabel }}</span>
  </div>
</template>

<style scoped>
.sync-indicator {
  display: flex;
  min-height: 36px;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.45rem 0.65rem;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.63rem;
}

.sync-indicator--compact {
  width: 38px;
  height: 38px;
  justify-content: center;
  padding: 0;
}

.sync-indicator--saved {
  color: var(--success);
}

.sync-indicator--offline {
  color: var(--olive);
}

.sync-indicator--error {
  color: var(--danger);
}

.sync-indicator__icon {
  position: relative;
  display: grid;
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  place-items: center;
}

.sync-indicator__icon svg {
  width: 14px;
  height: 14px;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.sync-indicator__spinner {
  opacity: 0;
  stroke-dasharray: 28 16;
  transform-origin: center;
  transition: opacity 100ms var(--ease-out-quick);
}

.sync-indicator__check {
  opacity: 1;
  stroke-dasharray: 13;
  stroke-dashoffset: 0;
  transition: opacity 100ms var(--ease-out-quick);
}

.sync-indicator--syncing .sync-indicator__spinner {
  opacity: 1;
  animation: sync-spin 1.2s linear infinite;
}

.sync-indicator--syncing .sync-indicator__check {
  opacity: 0;
}

.sync-indicator__state-icon--draw .sync-indicator__check {
  animation: draw-check 300ms var(--ease-out-quick) both;
}

.sync-label-enter-active,
.sync-label-leave-active {
  transition: opacity 90ms var(--ease-out-quick);
}

.sync-label-enter-from,
.sync-label-leave-to {
  opacity: 0;
}

@keyframes sync-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes draw-check {
  from {
    stroke-dashoffset: 13;
  }
}
</style>
