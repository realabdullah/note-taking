<script lang="ts" setup>
	definePageMeta({
		name: "reset-password",
		layout: "auth",
		middleware: ["guest"],
	});

	const isPasswordHidden = ref(true);
	const isConfirmPasswordHidden = ref(true);

	const state = reactive<Partial<resetPasswordFormSchemaType>>({
		password: "",
		confirmPassword: "",
	});

	const schema = resetPasswordFormSchema;

	useSeoMeta({
		title: "Reset Password -- Notes",
		description: "Reset your password",
		keywords: "reset password, password",
	});

	const { loadstates } = storeToRefs(useStore());
	const { $api } = useNuxtApp();
	const onSubmit = async () => $api.resetPassword(state.password!);
</script>

<template>
	<div>
		<div class="text-center">
			<h2 class="font-bold text-2xl text-neutral-950 dark:text-white">Reset Your Password</h2>
			<p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
				Enter your new password below to reset it.
			</p>
		</div>

		<div class="mt-10">
			<UForm :state :schema class="space-y-4 w-full" @submit.prevent="onSubmit">
				<UFormField label="New Password" :ui="labelUi" name="password" size="xl">
					<UInput
						v-model="state.password"
						:ui="inputOutlineUi"
						:type="isPasswordHidden ? 'password' : 'text'"
						size="xl"
						:disabled="loadstates.isRecoveringPassword"
					>
						<template #trailing>
							<UButton
								variant="link"
								size="sm"
								:icon="isPasswordHidden ? 'i-custom-show-password' : 'i-custom-hide-password'"
								aria-label="Show password"
								:aria-pressed="!isPasswordHidden"
								aria-controls="password"
								@click="isPasswordHidden = !isPasswordHidden"
							/>
						</template>
					</UInput>
				</UFormField>

				<UFormField label="Confirm New Password" :ui="labelUi" name="confirmPassword" size="xl">
					<UInput
						v-model="state.confirmPassword"
						:ui="inputOutlineUi"
						:type="isConfirmPasswordHidden ? 'password' : 'text'"
						size="xl"
						:disabled="loadstates.isRecoveringPassword"
					>
						<template #trailing>
							<UButton
								variant="link"
								size="sm"
								:icon="isConfirmPasswordHidden ? 'i-custom-show-password' : 'i-custom-hide-password'"
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
					class="text-white font-semibold text-base"
					block
					:loading="loadstates.isRecoveringPassword"
					:disabled="loadstates.isRecoveringPassword"
				/>
			</UForm>
		</div>
	</div>
</template>
