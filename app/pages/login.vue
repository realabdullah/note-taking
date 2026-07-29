<script setup lang="ts">
import { ArrowRight, Globe } from "@lucide/vue"
import { authClient } from "~/lib/auth-client"

definePageMeta({ layout: "auth", middleware: "guest" })
useSeoMeta({ title: "Sign in · Fieldnote" })

const route = useRoute()
const config = useRuntimeConfig()
const email = ref("")
const password = ref("")
const pending = ref(false)
const errorMessage = ref("")

const signIn = async () => {
  errorMessage.value = ""
  pending.value = true

  const { error } = await authClient.signIn.email({
    email: email.value,
    password: password.value,
    rememberMe: true,
  })

  pending.value = false
  if (error) {
    errorMessage.value = error.message ?? "Unable to sign in."
    return
  }

  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/"
  await navigateTo(redirect)
}

const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  })
}
</script>

<template>
  <AuthPanel eyebrow="Welcome back" title="Return to your notes." description="Your latest thought is waiting exactly where you left it.">
    <form class="auth-form" @submit.prevent="signIn">
      <label class="field">
        <span class="field__label">EMAIL</span>
        <input v-model="email" class="input" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>
      <div class="field">
        <label class="field__label" for="login-password">PASSWORD</label>
        <PasswordInput
          id="login-password"
          v-model="password"
          label="password"
          autocomplete="current-password"
          minlength="8"
          required
          placeholder="Your password"
        />
      </div>

      <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>

      <div class="login-row">
        <NuxtLink to="/forgot-password">Forgot password?</NuxtLink>
      </div>

      <button class="button button--primary" type="submit" :disabled="pending">
        {{ pending ? "Opening notebook…" : "Sign in" }}
        <ArrowRight :size="16" aria-hidden="true" />
      </button>

      <template v-if="config.public.googleAuthEnabled">
        <div class="auth-divider">or</div>
        <button class="button button--quiet" type="button" @click="signInWithGoogle">
          <Globe :size="16" aria-hidden="true" />
          Continue with Google
        </button>
      </template>

      <p class="auth-form__switch">New to Fieldnote? <NuxtLink to="/signup">Create an account</NuxtLink></p>
    </form>
  </AuthPanel>
</template>

<style scoped>
.login-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.35rem;
  color: var(--accent);
  font-size: 0.75rem;
}
</style>
