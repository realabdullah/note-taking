<script lang="ts" setup>
	const route = useRoute();

	const filteredNotes = computed(() => {
		const tags = (route.query.tags as string)?.split(",");
		return tags ? notes.filter(note => tags.some(tag => note.tags.includes(tag))) : notes;
	});

	const activeLink = ref<string>(slugify(route.params.link as string));
	const onNavigate = (link: string) => {
		activeLink.value = slugify(link);
		navigateTo({ path: `/dashboard/notes/${slugify(link)}`, query: route.query });
	};
</script>

<template>
	<div class="space-y-4">
		<div class="sticky top-0 pt-5 bg-white dark:bg-black">
			<UButton label="+ Create New Note" size="xl" class="dark:text-white cursor-pointer" block />
		</div>

		<div class="flex flex-col gap-1">
			<template v-for="(note, index) in filteredNotes" :key="index">
				<div
					class="w-full p-2 space-y-3 rounded-[6px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
					:class="[{ 'bg-neutral-100 dark:bg-neutral-800': $route.params.title === slugify(note.title) }]"
					@click="onNavigate(note.title)"
				>
					<h3 class="space-y-3 font-semibold text-base text-neutral-950 dark:text-white">
						{{ note.title }}
					</h3>
					<ul class="flex flex-wrap gap-1">
						<li
							v-for="tag in note.tags"
							:key="tag"
							class="py-[2px] px-[6px] bg-neutral-200 dark:bg-neutral-600 rounded-sm font-normal text-sm flex items-center text-neutral-950 dark:text-white"
						>
							{{ tag }}
						</li>
					</ul>
					<p class="font-normal text-xs text-neutral-700 dark:text-neutral-300">{{ formatDate(note.lastEdited) }}</p>
				</div>

				<div v-if="index !== notes.length - 1" class="my-1">
					<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />
				</div>
			</template>
		</div>
	</div>
</template>
