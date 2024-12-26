<script lang="ts" setup>
	const { isDark } = useThemeMode();

	const settings = [
		{ title: "Color Theme", icon: "sun", value: "ColorTheme" },
		{ title: "Font Theme", icon: "font", value: "FontTheme" },
		{ title: "Change Password", icon: "lock", value: "ChangePassword" },
	];

	const selectedSetting = defineModel<string>();
	const { isDesktop } = useDeviceType();
	const { api } = useAPI();
</script>

<template>
	<div class="px-1 py-5 pb-20 lg:pb-0">
		<h2 v-if="!isDesktop" class="mb-4 text-2xl font-bold text-neutral-950 dark:text-white">Settings</h2>

		<div class="space-y-2">
			<button
				v-for="(setting, index) in settings"
				:key="index"
				class="flex items-center justify-between gap-3 p-2 w-full"
				:class="{ 'bg-neutral-100 dark:bg-neutral-800 rounded-md': selectedSetting === setting.value }"
				@click="selectedSetting = setting.value"
			>
				<div class="flex items-center gap-2">
					<CustomIcon
						:name="setting.icon"
						:stroke="
							isDark && selectedSetting === setting.value ? '#335CFF' : isDark ? '#E0E4EA' : '#0E121B'
						"
						:fill="isDark && selectedSetting === setting.value ? '#335CFF' : isDark ? '#E0E4EA' : '#0E121B'"
					/>
					<span class="text-sm font-medium text-neutral-950 dark:text-white whitespace-nowrap">
						{{ setting.title }}
					</span>
				</div>

				<CustomIcon
					v-if="selectedSetting === setting.value"
					name="chevron-right"
					width="20"
					height="20"
					:fill="isDark ? '#E0E4EA' : '#2B303B'"
				/>
			</button>

			<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />

			<button
				class="mt-2 flex items-center gap-2 p-2 w-full hover:bg-neutral-100 hover:dark:bg-neutral-800 hover:rounded-md"
				@click="api?.logout()"
			>
				<CustomIcon name="logout" :stroke="isDark ? '#E0E4EA' : '#0E121B'" />
				<span class="text-sm font-medium text-neutral-950 dark:text-white whitespace-nowrap">Logout</span>
			</button>
		</div>
	</div>
</template>
