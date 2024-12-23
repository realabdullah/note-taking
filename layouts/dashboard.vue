<script lang="ts" setup>
	import { useDeviceType } from "@/composables/useDeviceType";
import MobileTags from "~/components/MobileTags.vue";

	const { isDark } = useThemeMode();
	const { isDesktop } = useDeviceType();

	const { selectedMenu } = storeToRefs(useStore());
</script>

<template>
	<div
		class="h-dvh w-dvw scheme-light-dark relative grid grid-cols-10 grid-rows-[100dvh]"
		:class="[!isDesktop ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white dark:bg-black']"
	>
		<TheBottomBar v-if="!isDesktop" />
		<TheSidebar v-else />

		<div :class="[isDesktop ? 'col-span-8' : 'col-span-full h-[calc(100dvh-57px)]']">
			<TheHeader v-if="isDesktop" />
			<div v-else class="py-5 px-8">
				<NuxtLink to="/notes" class="block">
					<CustomIcon name="logo" width="95" height="28" :fill="isDark ? '#FFFFFF' : '#0E121B'" />
				</NuxtLink>
			</div>
			<MobileTags v-if="!isDesktop && selectedMenu === 'tags'" />
			<NuxtPage />
		</div>
	</div>
</template>
