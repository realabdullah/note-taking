<script setup lang="ts">
import { ArrowRight, Globe } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"

definePageMeta({ layout: "auth", middleware: "guest" })
useSeoMeta({ title: "Create account · Fieldnote" })

const config = useRuntimeConfig()
const name = ref("")
const email = ref("")
const password = ref("")
const pending = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const signUp = async () => {
  errorMessage.value = ""
  successMessage.value = ""
  pending.value = true

  const { error } = await authClient.signUp.email({
    name: name.value,
    email: email.value,
    password: password.value,
    callbackURL: "/",
  })

  pending.value = false
  if (error) {
    errorMessage.value = error.message ?? "Unable to create your account."
    return
  }

  successMessage.value = "Check your email to verify your address, then return to your notebook."
}

const signUpWithGoogle = async () => {
  await authClient.signIn.social({ provider: "google", callbackURL: "/" })
}
</script>

<template>
  <AuthPanel
    eyebrow="A notebook of your own"
    title="Start with a blank page."
    description="Capture on one device and continue on another, without thinking about saving."
  >
    <form class="auth-form" @submit.prevent="signUp">
      <label class="field">
        <span class="field__label">YOUR NAME</span>
        <input v-model="name" class="input" type="text" autocomplete="name" required placeholder="How should we address you?" />
      </label>
      <label class="field">
        <span class="field__label">EMAIL</span>
        <input v-model="email" class="input" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>
      <div class="field">
        <label class="field__label" for="signup-password">PASSWORD</label>
        <PasswordInput
          id="signup-password"
          v-model="password"
          label="password"
          autocomplete="new-password"
          minlength="8"
          maxlength="128"
          required
          placeholder="At least 8 characters"
        />
      </div>

      <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="auth-form__success" role="status">{{ successMessage }}</p>

      <button class="button button--primary" type="submit" :disabled="pending || Boolean(successMessage)">
        {{ pending ? "Preparing your notebook…" : "Create account" }}
        <ArrowRight :size="16" aria-hidden="true" />
      </button>

      <template v-if="config.public.googleAuthEnabled">
        <div class="auth-divider">or</div>
        <button class="button button--quiet" type="button" @click="signUpWithGoogle">
          <Globe :size="16" aria-hidden="true" />
          Continue with Google
        </button>
      </template>

      <p class="auth-form__switch">Already have a notebook? <NuxtLink to="/login">Sign in</NuxtLink></p>
    </form>
  </AuthPanel>
</template>
