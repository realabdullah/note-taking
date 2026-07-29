<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <section class="auth-panel paper">
    <header>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.auth-panel {
  width: min(460px, 100%);
  padding: clamp(1.5rem, 6vw, 3rem);
}

.auth-panel header {
  margin-bottom: 1.75rem;
}

.auth-panel h1 {
  margin: 0.45rem 0 0;
  font-size: clamp(2.1rem, 8vw, 3.5rem);
  letter-spacing: -0.055em;
  line-height: 1;
}

.auth-panel header > p:last-child {
  margin: 0.85rem 0 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}

:deep(.auth-form) {
  display: grid;
  gap: 1rem;
}

:deep(.auth-form__error) {
  margin: 0;
  border-left: 3px solid var(--danger);
  padding: 0.6rem 0.75rem;
  background: color-mix(in srgb, var(--danger) 8%, transparent);
  color: var(--danger);
  font-size: 0.78rem;
}

:deep(.auth-form__success) {
  margin: 0;
  border-left: 3px solid var(--success);
  padding: 0.6rem 0.75rem;
  background: color-mix(in srgb, var(--success) 8%, transparent);
  color: var(--success);
  font-size: 0.78rem;
}

:deep(.auth-form__switch) {
  margin: 0.45rem 0 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
  text-align: center;
}

:deep(.auth-form__switch a) {
  color: var(--accent);
  font-weight: 600;
}

:deep(.auth-divider) {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
}

:deep(.auth-divider::before),
:deep(.auth-divider::after) {
  height: 1px;
  background: var(--line);
  content: "";
}
</style>
