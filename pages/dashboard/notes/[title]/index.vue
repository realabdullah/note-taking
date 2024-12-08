<script lang="ts" setup>
	definePageMeta({
		name: "note",
		layout: "dashboard",
	});

	const isDark = useIsDark();
	const route = useRoute();

	const note = reactive({
		title: "",
		content: "",
		tags: [],
		lastEdited: new Date(),
	});

	onMounted(() => {
		const dNote = notes.find(note => slugify(note.title) === route.params.title);
		Object.assign(note, dNote);
	});
</script>

<template>
	<div class="py-6 px-5 sticky top-0 bg-white dark:bg-black z-50">
		<h1 class="font-bold text-2xl text-neutral-950 dark:text-white">{{ note?.title ?? "N/A" }}</h1>

		<div class="mt-4">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-[6px] w-[115px]">
					<CustomIcon name="tag" width="16" height="16" :stroke="isDark ? '#E0E4EA' : '#2B303B'" />
					<span class="font-normal text-sm text-neutral-700 dark:text-neutral-300">Tags</span>
				</div>

				<p class="">{{ note?.tags?.length ? note?.tags?.join(", ") : "N/A" }}</p>
			</div>
			<div class="mt-2 flex items-center gap-3">
				<div class="flex items-center gap-[6px] w-[115px]">
					<CustomIcon name="clock" width="16" height="16" :fill="isDark ? '#E0E4EA' : '#2B303B'" />
					<span class="font-normal text-sm text-neutral-700 dark:text-neutral-300">Last edited</span>
				</div>

				<p class="">{{ note?.lastEdited ? formatDate(note?.lastEdited) : "N/A" }}</p>
			</div>
		</div>

		<div class="my-4">
			<USeparator color="neutral" :ui="{ border: 'border-neutral-200 dark:border-neutral-800' }" />
		</div>
	</div>

	<div class="px-5 min-h-[50dvh] w-full overflow-hidden">
		<UTextarea
			v-model="note.content"
			placeholder="Type something..."
			class=""
			size="xl"
			variant="none"
			autofocus
			autoresize
		/>
	</div>
</template>
