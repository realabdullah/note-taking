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
			<UForm :state :schema class="space-y-4 w-full">
				<UFormField label="Email Address" :ui="labelUi" name="email" size="xl">
					<UInput v-model="state.email" :ui="inputOutlineUi" placeholder="email@example.com" size="xl" />
				</UFormField>

				<UButton
					type="submit"
					label="Send reset link"
					size="xl"
					class="text-white font-semibold text-base"
					block
				/>
			</UForm>
		</div>
	</div>
</template>
