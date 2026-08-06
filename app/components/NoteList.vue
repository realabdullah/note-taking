<script setup lang="ts">
	import { ArrowUpRight, CloudOff, RefreshCw } from "@lucide/vue";
	import type { Note } from "~~/shared/types/note";
	import { deriveNoteTitle, notePreview } from "~~/shared/utils/note";

	defineProps<{ notes: Note[]; selectedId?: string }>();
	const hydrated = ref(false);

	onMounted(() => {
		hydrated.value = true;
	});

	const formatRelativeTime = (value: string) => {
		const elapsed = Date.now() - Date.parse(value);
		const minutes = Math.max(1, Math.floor(elapsed / 60_000));
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d`;
		return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
	};

	const formatStableDate = (value: string) =>
		new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));

	const displayTime = (value: string) => (hydrated.value ? formatRelativeTime(value) : formatStableDate(value));
</script>

<template>
	<TransitionGroup name="note-row" tag="div" class="note-list">
		<NuxtLink
			v-for="note in notes"
			:key="note.id"
			:to="`/notes/${note.id}`"
			class="note-row"
			:class="{ 'note-row--selected': selectedId === note.id }"
		>
			<span class="note-row__trail" aria-hidden="true">
				<span />
			</span>
			<span class="note-row__body">
				<span class="note-row__title">{{ deriveNoteTitle(note.title, note.content) }}</span>
				<span class="note-row__preview">{{ notePreview(note.content) || "A blank page, waiting." }}</span>
				<span v-if="note.tags.length" class="note-row__tags">
					<span v-for="tag in note.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
				</span>
			</span>
			<span class="note-row__meta mono">
				<span>{{ displayTime(note.updatedAt) }}</span>
				<CloudOff v-if="note.syncState === 'local'" :size="13" aria-label="Saved locally" />
				<RefreshCw
					v-else-if="note.syncState === 'pending' || note.syncState === 'syncing'"
					:size="13"
					aria-label="Waiting to sync"
				/>
				<ArrowUpRight v-else :size="15" aria-hidden="true" />
			</span>
		</NuxtLink>
	</TransitionGroup>
</template>

<style scoped>
	.note-list {
		overflow: hidden;
		border-top: 1px solid var(--line-strong);
	}

	.note-row {
		display: grid;
		overflow: hidden;
		min-height: 104px;
		max-height: 180px;
		grid-template-columns: 22px minmax(0, 1fr) auto;
		gap: 0.9rem;
		align-items: start;
		border-bottom: 1px solid var(--line);
		padding: 1rem 0.35rem 1rem 0;
		transition:
			background-color var(--motion-fast) var(--ease-out-quick),
			padding var(--motion-fast) var(--ease-out-quick);
	}

	.note-row:hover,
	.note-row--selected {
		padding-inline: 0.7rem;
		background: var(--surface);
	}

	.note-row__trail {
		position: relative;
		align-self: stretch;
	}

	.note-row__trail::after {
		position: absolute;
		top: 1.1rem;
		bottom: -1.1rem;
		left: 50%;
		width: 1px;
		background: var(--line);
		content: "";
	}

	.note-row:last-child .note-row__trail::after {
		display: none;
	}

	.note-row__trail span {
		position: relative;
		z-index: 1;
		display: block;
		width: 8px;
		height: 8px;
		margin: 0.45rem auto 0;
		border-radius: 50%;
		background: var(--ink-faint);
		box-shadow: 0 0 0 4px var(--canvas);
	}

	.note-row:hover .note-row__trail span,
	.note-row--selected .note-row__trail span {
		background: var(--thread);
		box-shadow: 0 0 0 4px var(--thread-soft);
	}

	.note-row__body {
		display: grid;
		min-width: 0;
	}

	.note-row__title {
		overflow: hidden;
		font-family: var(--font-serif);
		font-size: 1.14rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.note-row__preview {
		display: -webkit-box;
		overflow: hidden;
		margin-top: 0.25rem;
		color: var(--ink-soft);
		font-size: 0.84rem;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.note-row__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-top: 0.55rem;
		color: var(--thread);
		font-size: 0.68rem;
		font-weight: 600;
	}

	.note-row__meta {
		display: flex;
		min-width: 48px;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4rem;
		padding-top: 0.2rem;
		color: var(--ink-faint);
		font-size: 0.68rem;
		font-variant-numeric: tabular-nums;
		opacity: 0.72;
		transition: opacity var(--motion-fast) var(--ease-out-quick);
	}

	.note-row__meta svg {
		opacity: 0.45;
		transform: translateX(-2px);
		transition:
			opacity var(--motion-fast) var(--ease-out-quick),
			transform var(--motion-fast) var(--ease-out-quick);
	}

	.note-row:hover .note-row__meta,
	.note-row:hover .note-row__meta svg,
	.note-row--selected .note-row__meta,
	.note-row--selected .note-row__meta svg {
		opacity: 1;
	}

	.note-row:hover .note-row__meta svg,
	.note-row--selected .note-row__meta svg {
		transform: translateX(0);
	}

	.note-row-enter-active {
		transition:
			min-height 140ms var(--ease-out-quick),
			max-height 140ms var(--ease-out-quick),
			padding 140ms var(--ease-out-quick),
			opacity 120ms var(--ease-out-quick);
	}

	.note-row-leave-active {
		transition:
			min-height 300ms var(--ease-in-out-soft),
			max-height 300ms var(--ease-in-out-soft),
			padding 300ms var(--ease-in-out-soft),
			opacity 180ms var(--ease-in-out-soft);
	}

	.note-row-move {
		transition: transform 280ms var(--ease-in-out-soft);
	}

	.note-row-enter-from,
	.note-row-leave-to {
		min-height: 0;
		max-height: 0;
		padding-top: 0;
		padding-bottom: 0;
		opacity: 0;
	}

	@media (max-width: 560px) {
		.note-row {
			grid-template-columns: 16px minmax(0, 1fr) auto;
			gap: 0.65rem;
		}
	}
</style>
