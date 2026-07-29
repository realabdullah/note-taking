<script setup lang="ts">
import { ArrowRight } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"

definePageMeta({ layout: "auth", middleware: "guest" })
useSeoMeta({ title: "Reset password · Fieldnote" })

const email = ref("")
const pending = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const requestReset = async () => {
  pending.value = true
  errorMessage.value = ""

  const { error } = await authClient.requestPasswordReset({
    email: email.value,
    redirectTo: `${window.location.origin}/reset-password`,
  })

  pending.value = false
  if (error) {
    errorMessage.value = error.message ?? "Unable to send the reset link."
    return
  }
  successMessage.value = "If that account exists, a reset link is on its way."
}
</script>

<template>
  <AuthPanel
    eyebrow="Account recovery"
    title="Find your way back."
    description="Enter your email and we’ll send a time-limited link to choose a new password."
  >
    <form class="auth-form" @submit.prevent="requestReset">
      <label class="field">
        <span class="field__label">EMAIL</span>
        <input v-model="email" class="input" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>
      <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="auth-form__success" role="status">{{ successMessage }}</p>
      <button class="button button--primary" type="submit" :disabled="pending">
        {{ pending ? "Sending…" : "Send reset link" }}
        <ArrowRight :size="16" aria-hidden="true" />
      </button>
      <p class="auth-form__switch"><NuxtLink to="/login">Return to sign in</NuxtLink></p>
    </form>
  </AuthPanel>
</template>
