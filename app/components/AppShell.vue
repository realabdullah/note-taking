<script setup lang="ts">
import { Archive, FileText, LogOut, Menu, Plus, Search, Settings, X } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"
import { clearLocalUserData } from "~/lib/local-db.client"

const route = useRoute()
const session = authClient.useSession()
const navigationOpen = ref(false)
const { requestQuickCapture } = useQuickCapture()

const navigation = [
  { label: "Notes", to: "/notes", icon: FileText },
  { label: "Search", to: "/search", icon: Search },
  { label: "Archive", to: "/archive", icon: Archive },
  { label: "Settings", to: "/settings", icon: Settings },
]

const isActive = (path: string) =>
  path === "/notes" ? route.path === "/notes" || route.path.startsWith("/notes/") : route.path === path

const activeNavigationIndex = computed(() => navigation.findIndex((item) => isActive(item.to)))

const openQuickCapture = async () => {
  navigationOpen.value = false
  await requestQuickCapture()
}

const signOut = async () => {
  const userId = session.value.data?.user.id
  if (userId) await clearLocalUserData(userId)
  await authClient.signOut()
  await navigateTo("/login")
}

const handleShortcut = (event: KeyboardEvent) => {
  if (!(event.metaKey || event.ctrlKey)) return

  if (event.key.toLowerCase() === "n") {
    event.preventDefault()
    void openQuickCapture()
  }

  if (event.key.toLowerCase() === "k") {
    event.preventDefault()
    void navigateTo("/search")
  }
}

onMounted(() => window.addEventListener("keydown", handleShortcut))
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut))
watch(
  () => route.fullPath,
  () => (navigationOpen.value = false),
)
</script>

<template>
  <div class="app-shell">
    <header class="mobile-header">
      <NuxtLink class="mobile-header__brand" to="/">Fieldnote</NuxtLink>
      <div class="mobile-header__actions">
        <SyncIndicator compact />
        <button class="icon-button" type="button" aria-label="Open navigation" @click="navigationOpen = true">
          <Menu :size="20" aria-hidden="true" />
        </button>
      </div>
    </header>

    <aside class="sidebar" :class="{ 'sidebar--open': navigationOpen }" aria-label="Primary navigation">
      <div class="sidebar__mobile-top">
        <span class="sidebar__wordmark">Fieldnote</span>
        <button class="icon-button" type="button" aria-label="Close navigation" @click="navigationOpen = false">
          <X :size="20" aria-hidden="true" />
        </button>
      </div>

      <NuxtLink class="sidebar__brand" to="/">
        <span class="sidebar__brand-mark">F</span>
        <span>
          <strong>Fieldnote</strong>
          <small class="mono">QUICK CAPTURE</small>
        </span>
      </NuxtLink>

      <button class="capture-button" type="button" @click="openQuickCapture">
        <Plus :size="19" aria-hidden="true" />
        <span>Capture a note</span>
        <kbd>⌘N</kbd>
      </button>

      <nav class="sidebar__nav" :style="{ '--active-index': Math.max(0, activeNavigationIndex) }">
        <span
          class="sidebar__nav-indicator"
          :class="{ 'sidebar__nav-indicator--hidden': activeNavigationIndex < 0 }"
          aria-hidden="true"
        />
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'nav-link--active': isActive(item.to) }"
        >
          <component :is="item.icon" :size="18" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <kbd v-if="item.to === '/search'">⌘K</kbd>
        </NuxtLink>
      </nav>

      <div class="sidebar__footer">
        <InstallButton compact />
        <SyncIndicator />
        <div class="account">
          <span class="account__avatar">{{ session.data?.user.name?.slice(0, 1).toUpperCase() || "F" }}</span>
          <span class="account__copy">
            <strong>{{ session.data?.user.name || "Fieldnote user" }}</strong>
            <small>{{ session.data?.user.email }}</small>
          </span>
          <button class="icon-button" type="button" aria-label="Sign out" @click="signOut">
            <LogOut :size="17" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>

    <button
      v-if="navigationOpen"
      class="sidebar-backdrop"
      type="button"
      aria-label="Close navigation"
      @click="navigationOpen = false"
    />

    <main class="app-main">
      <slot />
    </main>

    <InstallPromptBanner />
  </div>
</template>

<style scoped>
.mobile-header {
  position: fixed;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  display: none;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(16px);
}

.mobile-header__brand,
.sidebar__wordmark {
  font-size: 1.15rem;
  font-weight: 600;
}

.mobile-header__actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.sidebar {
  position: fixed;
  z-index: 40;
  inset: 0 auto 0 0;
  display: flex;
  width: var(--sidebar-width);
  flex-direction: column;
  border-right: 1px solid var(--line);
  padding: 1.35rem;
  background:
    linear-gradient(155deg, color-mix(in srgb, var(--accent) 5%, transparent), transparent 42%), var(--paper-raised);
}

.sidebar__mobile-top {
  display: none;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.2rem 0.25rem;
}

.sidebar__brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50% 50% 48% 52%;
  background: var(--ink);
  color: var(--paper);
  font-size: 1.25rem;
  transform: rotate(-4deg);
}

.sidebar__brand span:last-child {
  display: grid;
  line-height: 1.15;
}

.sidebar__brand strong {
  font-size: 1.18rem;
}

.sidebar__brand small {
  margin-top: 0.2rem;
  color: var(--ink-faint);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
}

.capture-button {
  display: grid;
  min-height: 52px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.65rem;
  margin: 1.7rem 0;
  border: 0;
  border-radius: var(--radius-md);
  padding: 0.75rem 0.9rem;
  background: var(--accent);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 24%, transparent);
  color: white;
  text-align: left;
  transition:
    transform var(--motion-fast) var(--ease-out-quick),
    box-shadow var(--motion-fast) var(--ease-out-quick);
}

.capture-button:hover {
  box-shadow: 0 14px 30px color-mix(in srgb, var(--accent) 30%, transparent);
  transform: translateY(-2px);
}

.capture-button span {
  font-weight: 600;
}

kbd {
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.12rem 0.35rem;
  background: color-mix(in srgb, var(--paper) 72%, transparent);
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1.4;
}

.capture-button kbd {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.12);
  color: white;
}

.sidebar__nav {
  position: relative;
  display: grid;
  gap: 0.2rem;
}

.sidebar__nav-indicator {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 3px;
  height: 45px;
  border-radius: 999px;
  background: var(--accent);
  pointer-events: none;
  opacity: 1;
  transform: translateY(calc(var(--active-index) * (45px + 0.2rem)));
  transition:
    opacity 80ms var(--ease-out-quick),
    transform 180ms var(--ease-in-out-soft);
}

.sidebar__nav-indicator--hidden {
  opacity: 0;
}

.nav-link {
  position: relative;
  display: grid;
  min-height: 45px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.7rem;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  transition:
    color var(--motion-fast) var(--ease-out-quick),
    background-color var(--motion-fast) var(--ease-out-quick);
}

.nav-link:hover,
.nav-link--active {
  background: var(--paper-deep);
  color: var(--ink);
}

.sidebar__footer {
  display: grid;
  gap: 0.75rem;
  margin-top: auto;
}

.account {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  border-top: 1px solid var(--line);
  padding-top: 1rem;
}

.account__avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: var(--olive);
  color: var(--paper-raised);
  font-size: 0.85rem;
  font-weight: 600;
}

.account__copy {
  display: grid;
  min-width: 0;
  line-height: 1.25;
}

.account__copy strong,
.account__copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account__copy strong {
  font-size: 0.78rem;
}

.account__copy small {
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 0.61rem;
}

.icon-button {
  display: inline-grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
  transition:
    background-color var(--motion-fast) var(--ease-out-quick),
    color var(--motion-fast) var(--ease-out-quick),
    transform 80ms var(--ease-out-quick);
}

.icon-button:hover {
  background: var(--paper-deep);
  color: var(--ink);
}

.icon-button:active {
  transform: scale(0.96);
}

.sidebar-backdrop {
  position: fixed;
  z-index: 35;
  inset: 0;
  border: 0;
  background: rgba(8, 11, 9, 0.46);
}

@media (max-width: 879px) {
  .mobile-header {
    display: flex;
  }

  .sidebar {
    width: min(88vw, 340px);
    transform: translateX(-105%);
    transition: transform 220ms var(--ease-out-quick);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar__mobile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .sidebar__brand {
    display: none;
  }

  .capture-button {
    margin-top: 0;
  }
}
</style>
