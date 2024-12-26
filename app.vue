<script lang="ts" setup>
	const { initializeAPI } = useAPI();
	onMounted(async () => {
		await initializeAPI({ type: "appwrite" });
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
