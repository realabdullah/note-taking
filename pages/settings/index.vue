<script lang="ts" setup>
	definePageMeta({ name: "settings", layout: "dashboard" });

	const { pageHeader } = storeToRefs(useStore());
	pageHeader.value = "Settings";

	const { isDesktop } = useDeviceType();

	const selectedSetting = ref("ColorTheme");
	const selectedOption = ref<{ [key: string]: string }>({ ColorTheme: "system", FontTheme: "sans-serif" });
	const options: { [key: string]: { title: string; desc: string; options: ThemeOption[] } } = {
		ColorTheme: { title: "Color Theme", desc: "Choose your color theme:", options: colorTheme },
		FontTheme: { title: "Font Theme", desc: "Choose your font theme:", options: fontThemes },
	};
</script>

<template>
	<div
		class="grid"
		:class="[
			isDesktop ? 'grid-cols-12 grid-rows-[calc(100dvh-74px)]' : 'grid-cols-1 grid-rows-[calc(100dvh-131px)]',
		]"
	>
		<div
			class="px-4 h-full overflow-y-auto"
			:class="[
				isDesktop
					? 'border-r border-neutral-200 dark:border-neutral-800 col-span-3 overflow-x-hidden'
					: 'bg-white dark:bg-black rounded-t-2xl cols-span-full overflow-hidden',
			]"
		>
			<SettingsBar v-if="isDesktop || selectedSetting === ''" v-model="selectedSetting" />

			<div v-else>
				<div class="mt-6 mb-3 flex items-center gap-3">
					<UButton
						variant="ghost"
						icon="i-lucide-chevron-left"
						label="Settings"
						class="font-medium text-sm text-neutral-600 dark:text-neutral-300 pl-0"
						@click="selectedSetting = ''"
					/>
				</div>

				<template v-if="['ColorTheme', 'FontTheme'].includes(selectedSetting)">
					<SettingsOptionSelector
						:model-value="selectedOption[selectedSetting]"
						:title="options[selectedSetting].title"
						:description="options[selectedSetting].desc"
						:options="options[selectedSetting].options"
						@apply="selectedOption[selectedSetting] = $event"
					/>
				</template>
			</div>
		</div>

		<template v-if="isDesktop">
			<div class="col-span-9 h-full overflow-x-hidden overflow-y-auto p-8">
				<template v-if="['ColorTheme', 'FontTheme'].includes(selectedSetting)">
					<SettingsOptionSelector
						:model-value="selectedOption[selectedSetting]"
						:title="options[selectedSetting].title"
						:description="options[selectedSetting].desc"
						:options="options[selectedSetting].options"
						@apply="selectedOption[selectedSetting] = $event"
					/>
				</template>
			</div>
		</template>
	</div>
</template>
