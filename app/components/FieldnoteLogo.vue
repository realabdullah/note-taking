<script setup lang="ts">
	withDefaults(defineProps<{ compact?: boolean; inverted?: boolean }>(), {
		compact: false,
		inverted: false,
	});
</script>

<template>
	<span class="fieldnote-logo" :class="{ 'fieldnote-logo--inverted': inverted }">
		<svg viewBox="0 0 48 48" class="fieldnote-logo__mark" fill="none" aria-hidden="true">
			<path d="M8 4h23l9 9v27a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V4Z" fill="currentColor" />
			<path d="M31 4v9h9L31 4Z" :fill="inverted ? 'oklch(0.86 0.19 118)' : 'var(--thread)'" />
			<path
				d="M15 17.5h14M15 23.5h9"
				:stroke="inverted ? 'oklch(0.265 0.09 307)' : 'var(--canvas)'"
				stroke-width="3"
				stroke-linecap="round"
			/>
			<path
				d="M15 34c4.2-6.4 7.8 3.7 13.1-1.7l7.4-8.1"
				:stroke="inverted ? 'oklch(0.67 0.235 39)' : 'var(--signal)'"
				stroke-width="3.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path d="m33.2 21.8 4.8-3.5-1.9 5.6-2.9-2.1Z" :fill="inverted ? 'oklch(0.67 0.235 39)' : 'var(--signal)'" />
		</svg>
		<span v-if="!compact" class="fieldnote-logo__name">fieldnote</span>
	</span>
</template>

<style scoped>
	.fieldnote-logo {
		display: inline-flex;
		min-width: max-content;
		min-height: 44px;
		flex-shrink: 0;
		align-items: center;
		gap: 0.625rem;
		color: var(--ink);
		isolation: isolate;
	}

	.fieldnote-logo--inverted {
		color: oklch(0.955 0.025 84);
	}

	.fieldnote-logo__mark {
		display: block;
		width: 44px;
		height: 44px;
		flex: 0 0 44px;
		overflow: visible;
	}

	.fieldnote-logo__name {
		font-family: var(--font-serif);
		font-size: 1.2rem;
		font-weight: 720;
		letter-spacing: -0.025em;
		line-height: 1;
		white-space: nowrap;
	}
</style>
