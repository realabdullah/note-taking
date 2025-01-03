<script lang="ts" setup>
	definePageMeta({
		name: "sign-up",
		layout: "auth",
		middleware: ["guest"],
	});

	const { config, loadstates } = storeToRefs(useStore());
	const { $api } = useNuxtApp();

	const isPasswordHidden = ref(true);
	const state = reactive<Partial<authFormSchemaType>>({
		email: "",
		password: "",
		securityQuestions: [],
		serverType: config.value.type,
		showSecurityQuestions: false,
	});

	const schema = authFormSchema;

	useSeoMeta({
		title: "Sign Up -- Notes",
		description: "Create your account",
		keywords: "sign up, register, account",
	});

	const proceed = () => {
		if (config.value.type === "appwrite") {
			$api.signUp(state.email!, state.password!);
		} else {
			if (state.showSecurityQuestions) {
				$api.signUp(state.email!, state.password!, state.securityQuestions!);
			} else {
				state.securityQuestions = [{ question: "", answer: "" }];
				state.showSecurityQuestions = true;
			}
		}
	};
</script>

<template>
	<div>
		<div class="text-center">
			<h2 class="font-bold text-2xl text-neutral-950 dark:text-white">Create Your Account</h2>
			<p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
				Sign up to start organizing your notes and boost your productivity.
			</p>
		</div>

		<div class="mt-10">
			<DBSelector />

			<UForm :state :schema class="space-y-4 w-full" @submit.prevent="proceed">
				<UFormField label="Email Address" :ui="labelUi" name="email" size="xl">
					<UInput v-model="state.email" :ui="inputOutlineUi" placeholder="email@example.com" size="xl" />
				</UFormField>

				<UFormField label="Password" :ui="labelUi" name="password" size="xl">
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
										:name="isPasswordHidden ? 'i-custom-show-password' : 'i-custom-hide-password'"
										:customize="customiseIcon"
										size="24"
									/>
								</template>
							</UButton>
						</template>
					</UInput>
				</UFormField>

				<SetSecurityQuestions
					v-if="config.type === 'indexeddb' && state.showSecurityQuestions && state.securityQuestions?.length"
					v-model="state.securityQuestions"
				/>

				<UButton
					type="submit"
					:label="config.type === 'indexeddb' && !state.showSecurityQuestions ? 'Proceed' : 'Sign up'"
					size="xl"
					class="text-white font-semibold text-base"
					block
					:loading="loadstates.signingUp"
				/>

				<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />
			</UForm>

			<p class="text-center mt-6 font-normal text-sm text-neutral-600 dark:text-neutral-300">Or sign up with:</p>

			<UButton
				class="my-4 border border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white"
				label="Google"
				size="xl"
				block
			>
				<template #leading>
					<UIcon name="i-custom-google" :customize="customiseIcon" class="text-white" size="24" />
				</template>
			</UButton>

			<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />

			<div class="text-center mt-4">
				<p class="font-normal text-sm text-neutral-600 dark:text-neutral-300">
					Already have an account?
					<ULink to="/login" class="text-neutral-950 dark:text-white"> Login </ULink>
				</p>
			</div>
		</div>
	</div>
</template>
