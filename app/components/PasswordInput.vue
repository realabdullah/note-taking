<script setup lang="ts">
import { Eye, EyeOff } from "@lucide/vue"
import { computed, ref } from "vue"

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  label?: string
}>()

const model = defineModel<string>({ required: true })
const visible = ref(false)

const toggleLabel = computed(() =>
  visible.value ? `Hide ${props.label ?? "password"}` : `Show ${props.label ?? "password"}`,
)
</script>

<template>
  <span class="password-input">
    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      class="input password-input__field"
      :type="visible ? 'text' : 'password'"
    />
    <button
      class="password-input__toggle"
      type="button"
      :aria-controls="id"
      :aria-label="toggleLabel"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" :size="18" aria-hidden="true" />
      <Eye v-else :size="18" aria-hidden="true" />
    </button>
  </span>
</template>

<style scoped>
.password-input {
  position: relative;
  display: block;
}

.password-input__field {
  padding-right: 3.25rem;
}

.password-input__toggle {
  position: absolute;
  top: 50%;
  right: 0.3rem;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
  transform: translateY(-50%);
}

.password-input__toggle:hover {
  background: var(--paper-deep);
  color: var(--ink);
}
</style>
