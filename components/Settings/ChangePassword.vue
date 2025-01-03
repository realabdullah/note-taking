<script lang="ts" setup>
	interface Props {
		loading?: boolean;
	}
	defineProps<Props>();

	const { isDark } = useThemeMode();

	const fields = ref([
		{ label: "Old Password", model: "oldPassword", hidden: true },
		{ label: "New Password", model: "password", hidden: true },
		{ label: "Confirm New Password", model: "confirmPassword", hidden: true },
	]);

	const state = reactive<Partial<changePasswordSchemaType>>({
		oldPassword: "",
		password: "",
		confirmPassword: "",
	});

	defineEmits<(event: "change-password", value: Record<string, string>) => void>();

	const { $api } = useNuxtApp();
	const onSubmit = () => $api.updatePassword(state.password!, state.oldPassword!);
</script>

<template>
	<div>
		<h2 class="mb-6 text-base font-semibold text-neutral-950 dark:text-white">Change Password</h2>

		<UForm :state :schema="changePasswordSchema" class="space-y-6 w-full" @submit.prevent="onSubmit">
			<UFormField
				v-for="(field, index) in fields"
				:key="index"
				:label="field.label"
				:ui="labelUi"
				:name="field.model"
				size="xl"
			>
				<UInput
					v-model="state[field.model as keyof typeof state]"
					:ui="inputOutlineUi"
					:type="field.hidden ? 'password' : 'text'"
					size="xl"
					:disabled="loading"
				>
					<template #trailing>
						<UButton
							variant="link"
							size="sm"
							aria-label="Show password"
							:aria-pressed="!field.hidden"
							aria-controls="password"
							@click="field.hidden = !field.hidden"
						>
							<template #leading>
								<CustomIcon
									:name="field.hidden ? 'show-password' : 'hide-password'"
									:fill="isDark ? '#FFFFFF' : '#2B303B'"
									:stroke="isDark ? '#FFFFFF' : '#2B303B'"
									width="20"
									height="20"
								/>
							</template>
						</UButton>
					</template>
				</UInput>
			</UFormField>

			<UButton
				type="submit"
				label="Save Password"
				class="mt-6 py-3 px-4 flex ml-auto text-white"
				:disabled="Object.values(state).includes('') || loading"
				:loading="loading"
			/>
		</UForm>
	</div>
</template>
