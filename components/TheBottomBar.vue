<script lang="ts" setup>
	const navs = [
		{ title: "Home", icon: "home", link: "/notes" },
		{ title: "Search", icon: "search", link: "search" },
		{ title: "Archived", icon: "archive", link: "/notes/archive" },
		{ title: "Tags", icon: "tag", link: "tags" },
		{ title: "Settings", icon: "settings", link: "/settings" },
	];

	const isDark = useIsDark();
	const route = useRoute();
	const selectedMenu = ref<string>(`${route.path}`);

	const onNavigate = (link: string) => {
		selectedMenu.value = link;
		if (link.startsWith("/")) {
			navigateTo(link);
		}
	};
</script>

<template>
	<div
		class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 py-3 px-8 grid grid-cols-5 justify-items-center gap-2 shadow-up dark:shadow-up-dark"
	>
		<template v-for="nav in navs" :key="nav.link">
			<button
				class="w-[68px] h-[32px] md:w-20 md:h-[50px] flex flex-col items-center justify-center p-2 gap-1 text-neutral-600 dark:text-white"
				:class="[
					selectedMenu === nav.link
						? 'text-blue-500 bg-blue-50 dark:bg-neutral-700 rounded-sm'
						: 'bg-transparent',
				]"
				@click="onNavigate(nav.link)"
			>
				<CustomIcon
					:name="nav.icon"
					width="24"
					height="24"
					:fill="selectedMenu === nav.link ? '#335CFF' : isDark ? '#99A0AE' : '#525866'"
					:stroke="selectedMenu === nav.link ? '#335CFF' : isDark ? '#99A0AE' : '#525866'"
				/>
				<span class="hidden md:block text-xs font-normal">{{ nav.title }}</span>
			</button>
		</template>
	</div>
</template>
