<script lang="ts" setup>
	definePageMeta({
		name: "forgot-password",
		layout: "auth",
		middleware: ["guest"],
	});

	const state = reactive<Partial<forgotPasswordFormSchemaType>>({
		email: "",
	});

	const schema = forgotPasswordFormSchema;

	useSeoMeta({
		title: "Forgot Password -- Notes",
		description: "Forgot your password? Enter your email below, and we’ll send you a link to reset it.",
		keywords: "forgot password, reset password, email",
	});

	const { loadstates } = storeToRefs(useStore());
	const { $api } = useNuxtApp();
	const onSubmit = async () => $api.createPasswordRecovery(state.email!);
</script>

<template>
	<div>
		<div class="text-center">
			<h2 class="font-bold text-2xl text-neutral-950 dark:text-white">Forgotten your password?</h2>
			<p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
				Enter your email below, and we’ll send you a link to reset it.
			</p>
		</div>

		<div class="mt-10">
			<DBSelector />

			<UForm :state :schema class="space-y-4 w-full" @submit.prevent="onSubmit">
				<UFormField label="Email Address" :ui="labelUi" name="email" size="xl">
					<UInput
						v-model="state.email"
						:ui="inputOutlineUi"
						placeholder="email@example.com"
						size="xl"
						:disabled="loadstates.isRecoveringPassword"
					/>
				</UFormField>

				<UButton
					type="submit"
					label="Send reset link"
					size="xl"
					class="text-white font-semibold text-base"
					block
					:disabled="loadstates.isRecoveringPassword"
					:loading="loadstates.isRecoveringPassword"
				/>
			</UForm>
		</div>
	</div>
</template>
