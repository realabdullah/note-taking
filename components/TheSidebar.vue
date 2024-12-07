<script lang="ts" setup>
	const navs = [
		{ title: "All Notes", icon: "home", link: "/dashboard" },
		{ title: "Archived Notes", icon: "archive", link: "/dashboard/archive" },
	];

	const savedTags = [
		"Cooking",
		"Dev",
		"Fitness",
		"Health",
		"Personal",
		"React",
		"Recipes",
		"Shopping",
		"Travel",
		"Typescript",
	];

	const isDark = useIsDark();

	const selectedTags = ref<string[]>([]);

	const handleTagClick = (tag: string) => {
		if (selectedTags.value.includes(tag)) {
			selectedTags.value = selectedTags.value.filter((t) => t !== tag);
		} else {
			selectedTags.value = [...selectedTags.value, tag];
		}

		const router = useRouter();
		const tags = selectedTags.value.join(",");
		router.push({ query: { tags: tags || undefined } });
	};
</script>

<template>
	<div class="h-dvh w-[272px] border-r border-neutral-200 dark:border-neutral-800 p-4 overflow-auto">
		<div class="mb-4">
			<CustomIcon name="logo" width="95" height="28" :fill="isDark ? '#FFFFFF' : '#0E121B'" />
		</div>

		<nav class="space-y-1 mb-2">
			<template v-for="nav in navs" :key="nav.link">
				<NuxtLink
					:to="nav.link"
					class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
					active-class="bg-neutral-100 dark:bg-neutral-800"
				>
					<div class="flex items-center gap-2">
						<CustomIcon
							:name="nav.icon"
							width="20"
							height="20"
							:fill="$route.path === nav.link ? '#335CFF' : isDark ? '#E0E4EA' : '#2B303B'"
							:stroke="$route.path === nav.link ? '#335CFF' : isDark ? '#E0E4EA' : '#2B303B'"
						/>
						<span class="text-sm font-medium text-neutral-950 dark:text-neutral-200">{{ nav.title }}</span>
					</div>

					<CustomIcon
						v-if="$route.path === nav.link"
						name="chevron-right"
						width="20"
						height="20"
						:fill="isDark ? '#E0E4EA' : '#2B303B'"
					/>
				</NuxtLink>
			</template>
		</nav>

		<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />

		<nav class="space-y-2 p-2">
			<h6 class="text-sm font-medium text-neutral-500">Tags</h6>

			<div v-for="tag in savedTags" :key="tag" class="space-y-1">
				<button
					class="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
					:class="{ 'bg-neutral-100 dark:bg-neutral-800': selectedTags.includes(tag) }"
					@click="handleTagClick(tag)"
				>
					<CustomIcon name="tag" width="20" height="20" :stroke="isDark ? '#E0E4EA' : '#2B303B'" />
					<p class="font-medium text-sm text-neutral-700 dark:text-neutral-200">{{ tag }}</p>
				</button>
			</div>
		</nav>
	</div>
</template>
