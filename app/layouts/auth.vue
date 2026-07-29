<script setup lang="ts">
useTheme()
</script>

<template>
  <main class="auth-layout">
    <NuxtLink class="auth-brand" to="/" aria-label="Fieldnote home">
      <span class="auth-brand__mark">F</span>
      <span>Fieldnote</span>
    </NuxtLink>
    <slot />
    <p class="auth-layout__aside mono">Private by default · Available everywhere</p>
  </main>
</template>

<style scoped>
.auth-layout {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 5rem 1rem;
  position: relative;
}

.auth-layout::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, transparent 49.9%, var(--line) 50%, transparent 50.1%),
    radial-gradient(circle at 50% 28%, var(--accent-soft), transparent 25rem);
  content: "";
  opacity: 0.55;
}

.auth-brand {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.auth-brand__mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
}

.auth-layout__aside {
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  margin: 0;
  color: var(--ink-faint);
  font-size: 0.68rem;
}
</style>
