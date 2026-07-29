<script setup lang="ts">
import { Check, CloudOff, LoaderCircle, TriangleAlert } from "@lucide/vue"

defineProps<{ compact?: boolean }>()

const { isOnline } = useConnection()
const { isSyncing, syncError, lastSyncedAt } = useNotes()
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true
})

const status = computed(() => {
  // Keep the first client render identical to SSR. The sync plugin can start
  // before hydration completes and would otherwise swap the Lucide icon.
  if (!hydrated.value) return { label: "Ready to sync", icon: Check, tone: "saved" }
  if (!isOnline.value) return { label: "Offline · saved locally", icon: CloudOff, tone: "offline" }
  if (isSyncing.value) return { label: "Syncing changes", icon: LoaderCircle, tone: "syncing" }
  if (syncError.value) return { label: syncError.value, icon: TriangleAlert, tone: "error" }
  return { label: lastSyncedAt.value ? "All changes saved" : "Ready to sync", icon: Check, tone: "saved" }
})
</script>

<template>
  <div class="sync-indicator" :class="[`sync-indicator--${status.tone}`, { 'sync-indicator--compact': compact }]">
    <component :is="status.icon" :size="14" :class="{ spin: status.tone === 'syncing' }" aria-hidden="true" />
    <span v-if="!compact">{{ status.label }}</span>
    <span v-else class="sr-only">{{ status.label }}</span>
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

.spin {
  animation: spin 850ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
