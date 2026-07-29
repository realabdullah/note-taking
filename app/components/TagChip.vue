<script setup lang="ts">
defineProps<{ label: string; active?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button class="tag-chip" :class="{ 'tag-chip--active': active }" type="button" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<style scoped>
.tag-chip {
  min-height: 30px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.32rem 0.6rem;
  background: transparent;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.65rem;
}

.tag-chip:hover,
.tag-chip--active {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
  background: var(--accent-soft);
  color: var(--accent-strong);
}
</style>
