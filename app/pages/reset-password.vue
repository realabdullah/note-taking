<script setup lang="ts">
import { ArrowRight } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"

definePageMeta({ layout: "auth", middleware: "guest" })
useSeoMeta({ title: "Choose a new password · Fieldnote" })

const route = useRoute()
const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""))
const password = ref("")
const pending = ref(false)
const errorMessage = ref(token.value ? "" : "This reset link is missing or invalid.")

const resetPassword = async () => {
  if (!token.value) return
  pending.value = true
  errorMessage.value = ""

  const { error } = await authClient.resetPassword({
    newPassword: password.value,
    token: token.value,
  })

  pending.value = false
  if (error) {
    errorMessage.value = error.message ?? "Unable to reset your password."
    return
  }
  await navigateTo("/login?reset=1")
}
</script>

<template>
  <AuthPanel
    eyebrow="One last step"
    title="Choose a new key."
    description="Use a password you have not used for this account before."
  >
    <form class="auth-form" @submit.prevent="resetPassword">
      <div class="field">
        <label class="field__label" for="reset-password">NEW PASSWORD</label>
        <PasswordInput
          id="reset-password"
          v-model="password"
          label="new password"
          autocomplete="new-password"
          minlength="8"
          maxlength="128"
          required
          placeholder="At least 8 characters"
        />
      </div>
      <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>
      <button class="button button--primary" type="submit" :disabled="pending || !token">
        {{ pending ? "Updating…" : "Set new password" }}
        <ArrowRight :size="16" aria-hidden="true" />
      </button>
    </form>
  </AuthPanel>
</template>
