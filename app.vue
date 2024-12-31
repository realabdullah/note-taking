<script lang="ts" setup></script>

<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<UApp>
				<NuxtPage />
			</UApp>
		</NuxtLayout>

		<Notivue v-slot="item">
			<NotivueSwipe :item="item">
				<Notification :item="item" />
			</NotivueSwipe>
		</Notivue>
	</div>
</template>
