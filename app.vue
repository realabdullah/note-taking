<script lang="ts" setup>
	const { initializeStorage } = useStorage();
	onMounted(async () => {
		await initializeStorage({ type: "indexeddb" });
	});
</script>

<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<UApp>
				<NuxtPage />
			</UApp>
		</NuxtLayout>
	</div>
</template>
