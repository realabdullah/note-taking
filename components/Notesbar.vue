<script lang="ts" setup>
	import { useStore } from "~/stores";

	const { usage } = defineProps<{
		usage: "all" | "archive";
	}>();

	const { notes } = storeToRefs(useStore());
	const route = useRoute();

	const filteredNotes = computed(() => {
		const tags = (route.query.tags as string)?.split(",");
		const result = tags ? notes.value.filter(note => tags.some(tag => note.tags.includes(tag))) : notes.value;
		return usage === "archive" ? result.filter(note => note.isArchived) : result.filter(note => !note.isArchived);
	});

	const activeLink = ref<string>(route.params.slug as string);
	const onNavigate = (slug: string) => {
		activeLink.value = slug;
		const routeName = usage === "archive" ? "archived-note" : "note";
		navigateTo({ name: routeName, query: route.query, params: { slug } });
	};

	const createNewNote = () => {
		const slug = `new-note-${Date.now()}`;
		activeLink.value = slug;
		navigateTo({ name: "note", query: route.query, params: { slug } });
	};

	const { isDesktop } = useDeviceType();
</script>

<template>
	<div class="space-y-4 pb-20 lg:pb-0">
		<div class="sticky top-0 pt-5 bg-white dark:bg-black">
			<UButton
				:label="isDesktop ? 'Create New Note' : ''"
				size="xl"
				class="dark:text-white cursor-pointer max-lg:fixed max-lg:bottom-[89px] max-lg:right-8 max-lg:z-50 max-lg:justify-center max-lg:h-16 max-lg:w-16 max-lg:rounded-[50%]"
				icon="i-lucide-plus"
				:block="isDesktop"
				@click="createNewNote"
			/>

			<h1 v-if="!isDesktop" class="pb-5 font-bold text-2xl text-neutral-950 dark:text-white">
				{{ usage === "archive" ? "Archived Notes" : "All Notes" }}
			</h1>

			<p
				v-if="usage === 'archive'"
				class="font-normal text-sm text-neutral-700 dark:text-neutral-200"
				:class="[isDesktop ? 'py-4' : 'pb-4']"
			>
				All your archived notes are stored here. You can restore or delete them anytime.
			</p>
		</div>

		<div class="flex flex-col gap-1">
			<template v-for="(note, index) in filteredNotes" :key="index">
				<div
					class="w-full p-2 space-y-3 rounded-[6px] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
					:class="[{ 'bg-neutral-100 dark:bg-neutral-800': $route.params.slug === note.slug }]"
					@click="onNavigate(note.slug)"
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
					<p class="font-normal text-xs text-neutral-700 dark:text-neutral-300">
						{{ formatDate(note.lastEdited) }}
					</p>
				</div>

				<div v-if="index !== notes.length - 1" class="my-1">
					<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />
				</div>
			</template>
		</div>
	</div>
</template>
