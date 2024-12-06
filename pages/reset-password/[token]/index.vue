<script lang="ts" setup>
definePageMeta({
  name: "reset-password",
  layout: "auth",
});

const isPasswordHidden = ref(true);
const isConfirmPasswordHidden = ref(true);

const state = reactive<Partial<resetPasswordFormSchemaType>>({
  password: "",
  confirmPassword: "",
  token: "",
});

const schema = resetPasswordFormSchema;
</script>

<template>
  <div>
    <div class="text-center">
      <h2 class="font-bold text-2xl text-neutral-950 dark:text-white">
        Forgotten your password?
      </h2>
      <p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
        Enter your email below, and we’ll send you a link to reset it.
      </p>
    </div>

    <div class="mt-10">
      <UForm :state :schema class="space-y-4 w-full">
        <UFormField
          label="New Password"
          :ui="labelUi"
          name="password"
          size="xl"
        >
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
                :icon="
                  isPasswordHidden
                    ? 'i-custom-show-password'
                    : 'i-custom-hide-password'
                "
                aria-label="Show password"
                :aria-pressed="!isPasswordHidden"
                aria-controls="password"
                @click="isPasswordHidden = !isPasswordHidden"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          label="Confirm New Password"
          :ui="labelUi"
          name="confirmPassword"
          size="xl"
        >
          <UInput
            v-model="state.confirmPassword"
            :ui="inputOutlineUi"
            :type="isConfirmPasswordHidden ? 'password' : 'text'"
            size="xl"
          >
            <template #trailing>
              <UButton
                variant="link"
                size="sm"
                :icon="
                  isConfirmPasswordHidden
                    ? 'i-custom-show-password'
                    : 'i-custom-hide-password'
                "
                aria-label="Show confitm password"
                :aria-pressed="!isConfirmPasswordHidden"
                aria-controls="password"
                @click="isConfirmPasswordHidden = !isConfirmPasswordHidden"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          label="Reset Password"
          size="xl"
          class="text-white font-semibold text-base cursor-pointer"
          block
        />
      </UForm>
    </div>
  </div>
</template>
