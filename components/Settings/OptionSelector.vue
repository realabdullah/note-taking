<script lang="ts" setup>
	interface Props {
		modelValue: string;
		options: ThemeOption[];
		title?: string;
		description?: string;
	}

	const props = defineProps<Props>();

	defineEmits<{
		(e: "apply", value: string): void;
	}>();

	const selected = ref(props.modelValue);
	const { isDark } = useThemeMode();

	watch(
		() => props.modelValue,
		val => (selected.value = val)
	);
</script>

<template>
	<div>
		<h2 class="text-base font-semibold text-neutral-950 dark:text-white">{{ title }}</h2>
		<p class="mt-1 text-sm font-normal text-neutral-700 dark:text-neutral-300">{{ description }}</p>

		<div class="mt-6 space-y-4">
			<button
				v-for="(option, index) in options"
				:key="index"
				class="border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-between gap-2 p-4 w-full cursor-pointer"
				:class="{ 'bg-neutral-100 dark:bg-neutral-800': selected === option.value }"
				@click="selected = option.value"
			>
				<div class="flex items-center gap-4">
					<CustomIcon
						class-name="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-2 rounded-xl"
						:name="option.icon"
						width="24"
						height="24"
						:stroke="isDark && selected === option.value ? '#335CFF' : isDark ? '#E0E4EA' : '#0E121B'"
						:fill="isDark && selected === option.value ? '#335CFF' : isDark ? '#E0E4EA' : '#0E121B'"
					/>

					<div class="text-left">
						<p class="text-sm font-medium text-neutral-950 dark:text-white">{{ option.title }}</p>
						<span class="text-xs font-normal text-neutral-700 dark:text-neutral-300">{{
							option.desc
						}}</span>
					</div>
				</div>

				<div
					class="rounded-[50%] h-5 w-5 border"
					:class="[
						selected === option.value ? 'border-blue-500 border-[5px]' : 'border-neutral-200 border-[2px]',
					]"
				></div>
			</button>
		</div>

		<UButton
			label="Apply Changes"
			class="mt-6 py-3 px-4 flex ml-auto text-white cursor-pointer"
			@click="$emit('apply', selected)"
		/>
	</div>
</template>
