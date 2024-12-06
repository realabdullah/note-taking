<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  name: "login",
  layout: "auth",
});

const isPasswordHidden = ref(true);
const state = reactive<Partial<authFormSchemaType>>({
  email: "",
  password: "",
});

const schema = authFormSchema;
</script>

<template>
  <div>
    <div class="text-center">
      <h2 class="font-bold text-2xl text-neutral-950 dark:text-white">
        Welcome to Note
      </h2>
      <p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
        Please log in to continue
      </p>
    </div>

    <div class="mt-10">
      <UForm :state :schema class="space-y-4 w-full">
        <UFormField label="Email Address" :ui="labelUi" name="email" size="xl">
          <UInput
            v-model="state.email"
            :ui="inputOutlineUi"
            placeholder="email@example.com"
            size="xl"
          />
        </UFormField>

        <UFormField label="Password" :ui="labelUi" name="password" size="xl">
          <template #hint>
            <ULink
              to="/forgot-password"
              class="font-normal text-xs text-neutral-600 underline"
            >
              Forgot
            </ULink>
          </template>
          <UInput
            v-model="state.password"
            :ui="inputOutlineUi"
            :type="isPasswordHidden ? 'password' : 'text'"
            size="xl"
          >
            <template #trailing>
              <UButton
                variant="link"
                size="sm"
                aria-label="Show password"
                :aria-pressed="!isPasswordHidden"
                aria-controls="password"
                @click="isPasswordHidden = !isPasswordHidden"
              >
                <template #leading>
                  <UIcon
                    :name="
                      isPasswordHidden
                        ? 'i-custom-show-password'
                        : 'i-custom-hide-password'
                    "
                    :customize="replaceIconColors"
                    size="24"
                  />
                </template>
              </UButton>
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          label="Login"
          size="xl"
          class="text-white font-semibold text-base cursor-pointer"
          block
        />

        <USeparator
          color="neutral"
          :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }"
        />
      </UForm>

      <p
        class="text-center mt-6 font-normal text-sm text-neutral-600 dark:text-neutral-300"
      >
        Or log in with:
      </p>

      <UButton
        class="my-4 border border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white cursor-pointer"
        label="Google"
        size="xl"
        block
      >
        <template #leading>
          <UIcon
            name="i-custom-google"
            :customize="replaceIconColors"
            class="text-white"
            size="24"
          />
        </template>
      </UButton>

      <USeparator
        color="neutral"
        :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }"
      />

      <div class="text-center mt-4">
        <p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
          No account yet?
          <ULink to="/signup" class="text-neutral-950 dark:text-white">
            Sign Up
          </ULink>
        </p>
      </div>
    </div>
  </div>
</template>
