<script setup lang="ts">
import { Download, X } from "@lucide/vue"

const { shouldShowBanner, install, dismissBanner } = usePwaInstall()
const installing = ref(false)

const beginInstall = async () => {
  installing.value = true
  await install()
  installing.value = false
}
</script>

<template>
  <Transition name="install-banner">
    <aside v-if="shouldShowBanner" class="install-banner paper" aria-labelledby="install-title">
      <span class="install-banner__mark"><Download :size="19" aria-hidden="true" /></span>
      <span class="install-banner__copy">
        <strong id="install-title">Keep Fieldnote within reach</strong>
        <small>Install the notebook for a focused, full-screen experience.</small>
      </span>
      <button class="button button--primary" type="button" :disabled="installing" @click="beginInstall">
        {{ installing ? "Opening…" : "Install" }}
      </button>
      <button class="install-banner__close" type="button" aria-label="Dismiss install prompt" @click="dismissBanner">
        <X :size="18" aria-hidden="true" />
      </button>
    </aside>
  </Transition>
</template>

<style scoped>
.install-banner {
  position: fixed;
  z-index: 50;
  right: 1.25rem;
  bottom: 1.25rem;
  display: grid;
  width: min(520px, calc(100vw - 2rem));
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid var(--line-strong);
  padding: 0.8rem;
  box-shadow: var(--shadow);
}

.install-banner__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
}

.install-banner__copy {
  display: grid;
}

.install-banner__copy small {
  color: var(--ink-soft);
  font-size: 0.76rem;
}

.install-banner__close {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
}

.install-banner-enter-active,
.install-banner-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.install-banner-enter-from,
.install-banner-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 640px) {
  .install-banner {
    right: 1rem;
    bottom: 5rem;
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .install-banner .button {
    grid-column: 1 / -1;
  }

  .install-banner__close {
    grid-column: 3;
    grid-row: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .install-banner-enter-active,
  .install-banner-leave-active {
    transition: none;
  }
}
</style>
