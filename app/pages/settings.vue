<script setup lang="ts">
import { Check, KeyRound, Laptop, Moon, Sun } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"
import type { ThemePreference } from "~/composables/useTheme"

definePageMeta({ middleware: "auth" })
useSeoMeta({ title: "Settings · Fieldnote" })

const session = authClient.useSession()
const { preference, setTheme } = useTheme()
const currentPassword = ref("")
const newPassword = ref("")
const pending = ref(false)
const message = ref("")
const errorMessage = ref("")

const themes: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
]

const changePassword = async () => {
  pending.value = true
  message.value = ""
  errorMessage.value = ""
  const { error } = await authClient.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    revokeOtherSessions: true,
  })
  pending.value = false

  if (error) {
    errorMessage.value = error.message ?? "Unable to change your password."
    return
  }

  currentPassword.value = ""
  newPassword.value = ""
  message.value = "Password changed. Other sessions were signed out."
}
</script>

<template>
  <div class="page settings-page">
    <header class="page-header">
      <div class="page-header__copy">
        <p class="eyebrow">Make it yours</p>
        <h1 class="page-title">Settings.</h1>
        <p class="page-header__description">A few careful choices. The notebook stays out of your way.</p>
      </div>
    </header>

    <section class="settings-section">
      <header>
        <span class="settings-section__number mono">01</span>
        <div>
          <h2>Appearance</h2>
          <p>Choose the paper that feels easiest on your eyes.</p>
        </div>
      </header>
      <div class="theme-grid">
        <button
          v-for="theme in themes"
          :key="theme.value"
          type="button"
          :class="{ active: preference === theme.value }"
          @click="setTheme(theme.value)"
        >
          <component :is="theme.icon" :size="20" aria-hidden="true" />
          <span>{{ theme.label }}</span>
          <Check v-if="preference === theme.value" :size="16" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section class="settings-section">
      <header>
        <span class="settings-section__number mono">02</span>
        <div>
          <h2>Account</h2>
          <p>{{ session.data?.user.email }}</p>
        </div>
      </header>
      <form class="password-form paper" @submit.prevent="changePassword">
        <KeyRound :size="22" aria-hidden="true" />
        <div class="field">
          <label class="field__label" for="current-password">CURRENT PASSWORD</label>
          <PasswordInput
            id="current-password"
            v-model="currentPassword"
            label="current password"
            autocomplete="current-password"
            required
          />
        </div>
        <div class="field">
          <label class="field__label" for="new-password">NEW PASSWORD</label>
          <PasswordInput
            id="new-password"
            v-model="newPassword"
            label="new password"
            autocomplete="new-password"
            minlength="8"
            maxlength="128"
            required
          />
        </div>
        <p v-if="errorMessage" class="settings-message settings-message--error" role="alert">{{ errorMessage }}</p>
        <p v-if="message" class="settings-message" role="status">{{ message }}</p>
        <button class="button button--primary" type="submit" :disabled="pending">
          {{ pending ? "Updating…" : "Change password" }}
        </button>
      </form>
    </section>

    <section class="settings-section">
      <header>
        <span class="settings-section__number mono">03</span>
        <div>
          <h2>Install</h2>
          <p>Add Fieldnote to your home screen for a focused, full-screen notebook.</p>
        </div>
      </header>
      <InstallButton />
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  width: min(900px, 100%);
}

.settings-section {
  border-top: 1px solid var(--line-strong);
  padding: 1.5rem 0 3rem;
}

.settings-section > header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.settings-section__number {
  color: var(--accent);
  font-size: 0.7rem;
}

.settings-section h2 {
  margin: 0;
  font-size: 1.5rem;
}

.settings-section header p {
  margin: 0.25rem 0 0;
  color: var(--ink-soft);
  font-size: 0.88rem;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.7rem;
  padding-left: 60px;
}

.theme-grid button {
  display: grid;
  min-height: 110px;
  grid-template-columns: auto 1fr auto;
  align-items: end;
  gap: 0.6rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 1rem;
  background: var(--paper-raised);
  text-align: left;
}

.theme-grid button.active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.password-form {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: end;
  gap: 1rem;
  margin-left: 60px;
  padding: 1rem;
}

.settings-message {
  grid-column: 2 / -1;
  margin: 0;
  color: var(--success);
  font-size: 0.75rem;
}

.settings-message--error {
  color: var(--danger);
}

@media (max-width: 720px) {
  .theme-grid,
  .password-form {
    grid-template-columns: 1fr;
    margin-left: 0;
    padding-left: 0;
  }

  .theme-grid {
    padding-left: 0;
  }

  .password-form {
    padding: 1rem;
  }

  .settings-message {
    grid-column: 1;
  }
}
</style>
