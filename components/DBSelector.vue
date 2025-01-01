<script lang="ts" setup>
	import { Info, Server } from "lucide-vue-next";

	const { config } = storeToRefs(useStore());

	const selectedDatabaseDescription = computed(() => {
		const selected = databaseOptions.find(option => option.value === config.value.type);
		return selected ? selected.desc : "";
	});

	const selectDatabase = (value: APItype) => {
		config.value.type = value;
		localStorage.setItem("notes-api", value);
	};

	watch(
		() => config.value.type,
		value => {
			selectDatabase(value as APItype);
		}
	);
</script>

<template>
	<div>
		<div class="grid grid-cols-2 gap-4 mt-4">
			<template v-for="option in databaseOptions" :key="option.value">
				<label
					class="flex flex-col items-center justify-between rounded-md transition-colors cursor-pointer p-4 dark:hover:bg-neutral-800"
					:class="[
						config.type === option.value
							? 'border-2 border-primary'
							: 'border-1 border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-100',
					]"
				>
					<input type="radio" :value="option.value" v-model="config.type" class="sr-only" />
					<Server class="mb-2 h-5 w-5" />
					<span class="text-sm font-medium">{{ option.label }}</span>
				</label>
			</template>
		</div>

		<div class="mt-1 mb-4 flex items-start gap-1">
			<Info class="mt-[2px] h-3 w-3" />
			<p class="text-xs text-neutral-600 dark:text-neutral-300">
				{{ selectedDatabaseDescription }}
			</p>
		</div>
	</div>
</template>
