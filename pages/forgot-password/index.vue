<script lang="ts" setup>
	definePageMeta({
		name: "forgot-password",
		layout: "auth",
		middleware: ["guest"],
	});

	const questions = ref<SecurityQuestion["questions"]>([]);
	const state = reactive<Partial<forgotPasswordFormSchemaType>>({
		email: "",
	});

	const schema = forgotPasswordFormSchema;

	useSeoMeta({
		title: "Forgot Password -- Notes",
		description: "Forgot your password? Enter your email below, and we’ll send you a link to reset it.",
		keywords: "forgot password, reset password, email",
	});

	const { loadstates, config } = storeToRefs(useStore());
	const { $api } = useNuxtApp();

	const onSubmit = async () => {
		if (config.value.type === "appwrite") {
			$api.createPasswordRecovery?.(state.email!);
		} else if (config.value.type === "indexeddb") {
			if (questions.value.length) {
				await $api.verifySecurityAnswers?.(
					state.email!,
					questions.value.map(q => q.answer)
				);
				return;
			}

			const res = await $api.getSecurityQuestions?.(state.email!);
			if (res) {
				questions.value = res.map(q => ({ question: q, answer: "" }));
			}
		}
	};
</script>

<template>
	<div>
		<div class="text-center">
			<h2 class="font-bold text-2xl text-neutral-950 dark:text-white">
				{{ questions.length ? "Answer security questions" : "Forgotten your password?" }}
			</h2>
			<p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
				{{
					questions.length
						? "Answer your security questions to reset your password."
						: "Enter your email below, and we’ll send you a link to reset it."
				}}
			</p>
		</div>

		<div class="mt-10">
			<DBSelector v-if="!questions.length" />

			<UForm :state :schema class="space-y-4 w-full" @submit.prevent="onSubmit">
				<SetSecurityQuestions
					v-if="config.type === 'indexeddb' && questions.length"
					v-model="questions"
					is-recovering-password
				/>

				<template v-else>
					<UFormField label="Email Address" :ui="labelUi" name="email" size="xl">
						<UInput
							v-model="state.email"
							:ui="inputOutlineUi"
							placeholder="email@example.com"
							size="xl"
							:disabled="loadstates.isRecoveringPassword"
						/>
					</UFormField>
				</template>
				<UButton
					type="submit"
					:label="
						config.type === 'indexeddb' && !questions.length
							? 'Reset password'
							: questions.length
								? 'Submit answer(s)'
								: 'Send reset link'
					"
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
