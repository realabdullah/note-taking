<script setup lang="ts">
import { Feather } from "@lucide/vue"

withDefaults(
  defineProps<{
    title: string
    description: string
    actionLabel?: string
  }>(),
  { actionLabel: undefined },
)

defineEmits<{ action: [] }>()
</script>

<template>
  <section class="empty-state paper">
    <div>
      <span class="empty-state__mark"><Feather :size="23" aria-hidden="true" /></span>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <button v-if="actionLabel" class="button button--primary" type="button" @click="$emit('action')">
        {{ actionLabel }}
      </button>
    </div>
  </section>
</template>
