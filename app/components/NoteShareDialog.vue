<script setup lang="ts">
	import { Check, Copy, Link2, LoaderCircle, Unlink, X } from "@lucide/vue";
	import type { NoteShare } from "~~/shared/types/note-share";
	import type { SyncState } from "~~/shared/types/note";

	const props = defineProps<{
		noteId: string;
		open: boolean;
		syncState?: SyncState;
	}>();

	const emit = defineEmits<{ close: [] }>();

	const dialog = ref<HTMLDialogElement | null>(null);
	const share = ref<NoteShare | null>(null);
	const isLoading = ref(false);
	const isMutating = ref(false);
	const copied = ref(false);
	const errorMessage = ref("");
	const canCreateShare = computed(() => props.syncState === "synced");

	const errorText = (error: unknown) => {
		const fetchError = error as { statusCode?: number; statusMessage?: string };
		if (fetchError.statusCode === 404) return "Sync this note before sharing it.";
		if (!navigator.onLine) return "Sharing needs an internet connection.";
		return fetchError.statusMessage || "Something went wrong. Try again.";
	};

	const loadShare = async () => {
		isLoading.value = true;
		errorMessage.value = "";

		try {
			const response = await $fetch<{ share: NoteShare | null }>(`/api/notes/${props.noteId}/share`);
			share.value = response.share;
		} catch (error) {
			errorMessage.value = errorText(error);
		} finally {
			isLoading.value = false;
		}
	};

	const createShare = async () => {
		isMutating.value = true;
		errorMessage.value = "";

		try {
			const response = await $fetch<{ share: NoteShare }>(`/api/notes/${props.noteId}/share`, {
				method: "POST",
			});
			share.value = response.share;
		} catch (error) {
			errorMessage.value = errorText(error);
		} finally {
			isMutating.value = false;
		}
	};

	const revokeShare = async () => {
		isMutating.value = true;
		errorMessage.value = "";

		try {
			await $fetch(`/api/notes/${props.noteId}/share`, { method: "DELETE" });
			share.value = null;
			copied.value = false;
		} catch (error) {
			errorMessage.value = errorText(error);
		} finally {
			isMutating.value = false;
		}
	};

	const copyShare = async () => {
		if (!share.value) return;

		try {
			await navigator.clipboard.writeText(share.value.url);
			copied.value = true;
			window.setTimeout(() => (copied.value = false), 2_000);
		} catch {
			errorMessage.value = "Copy failed. Select the link and copy it manually.";
		}
	};

	const selectLink = (event: FocusEvent) => {
		(event.currentTarget as HTMLInputElement).select();
	};

	const close = () => {
		if (dialog.value?.open) {
			dialog.value.close();
			return;
		}

		emit("close");
	};

	watch(
		() => props.open,
		async open => {
			if (!open) {
				if (dialog.value?.open) dialog.value.close();
				return;
			}

			await nextTick();
			dialog.value?.showModal();
			await loadShare();
		}
	);
</script>

<template>
	<Teleport to="body">
		<dialog
			ref="dialog"
			class="share-dialog"
			aria-labelledby="share-title"
			@cancel.prevent="close"
			@close="emit('close')"
		>
			<button class="share-dialog__close" type="button" aria-label="Close sharing dialog" @click="close">
				<X :size="18" aria-hidden="true" />
			</button>

			<div class="share-dialog__mark" aria-hidden="true">
				<Link2 :size="22" />
			</div>
			<p class="eyebrow">Public link</p>
			<h2 id="share-title">Share this note</h2>
			<p class="share-dialog__intro">
				Anyone with the link can read a snapshot of this note. Later edits stay private, and readers cannot
				browse your other notes.
			</p>

			<div v-if="isLoading" class="share-dialog__loading" role="status">
				<LoaderCircle class="share-dialog__spinner" :size="20" aria-hidden="true" />
				<span class="mono">Checking link…</span>
			</div>

			<template v-else-if="share">
				<label class="share-dialog__link-label" for="note-share-link">Shareable link</label>
				<div class="share-dialog__link-row">
					<input id="note-share-link" class="input mono" :value="share.url" readonly @focus="selectLink" />
					<button class="button button--primary" type="button" @click="copyShare">
						<Check v-if="copied" :size="17" aria-hidden="true" />
						<Copy v-else :size="17" aria-hidden="true" />
						{{ copied ? "Copied" : "Copy" }}
					</button>
				</div>
				<p class="share-dialog__hint mono">
					LIVE · CREATED {{ new Date(share.createdAt).toLocaleDateString() }}
				</p>
				<button
					class="button button--quiet button--danger share-dialog__revoke"
					type="button"
					:disabled="isMutating"
					@click="revokeShare"
				>
					<LoaderCircle v-if="isMutating" class="share-dialog__spinner" :size="17" aria-hidden="true" />
					<Unlink v-else :size="17" aria-hidden="true" />
					Revoke link
				</button>
			</template>

			<template v-else-if="!errorMessage">
				<div class="share-dialog__notice">
					<strong>{{
						canCreateShare ? "Private until you create a link" : "Waiting for this note to sync"
					}}</strong>
					<span>
						{{
							canCreateShare
								? "Creating one does not make the note discoverable in search engines."
								: "The snapshot is created from the server copy, so sharing starts after your latest changes arrive."
						}}
					</span>
				</div>
				<button
					class="button button--primary share-dialog__create"
					type="button"
					:disabled="isMutating || !canCreateShare"
					@click="createShare"
				>
					<LoaderCircle v-if="isMutating" class="share-dialog__spinner" :size="17" aria-hidden="true" />
					<Link2 v-else :size="17" aria-hidden="true" />
					Create public link
				</button>
			</template>

			<div v-if="errorMessage" class="share-dialog__error" role="alert">
				<p>{{ errorMessage }}</p>
				<button class="button button--quiet" type="button" @click="loadShare">Try again</button>
			</div>
		</dialog>
	</Teleport>
</template>

<style scoped>
	.share-dialog {
		position: fixed;
		inset: 0;
		width: min(520px, calc(100% - 2rem));
		max-height: min(720px, calc(100dvh - 2rem));
		margin: auto;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-lg);
		padding: clamp(1.5rem, 5vw, 2.4rem);
		background:
			linear-gradient(145deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent 44%),
			var(--paper-raised);
		color: var(--ink);
		box-shadow: var(--shadow);
	}

	.share-dialog::backdrop {
		background: color-mix(in srgb, var(--ink) 42%, transparent);
		backdrop-filter: blur(5px);
	}

	.share-dialog__close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: grid;
		width: 40px;
		height: 40px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--ink-soft);
	}

	.share-dialog__close:hover {
		background: var(--paper-deep);
		color: var(--ink);
	}

	.share-dialog__mark {
		display: grid;
		width: 48px;
		height: 48px;
		margin-bottom: 1.2rem;
		place-items: center;
		border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
		border-radius: 50% 44% 52% 46%;
		background: var(--accent-soft);
		color: var(--accent);
		transform: rotate(-4deg);
	}

	.share-dialog h2 {
		margin: 0.4rem 0 0;
		font-size: clamp(1.8rem, 5vw, 2.6rem);
		letter-spacing: -0.045em;
		line-height: 1;
	}

	.share-dialog__intro {
		margin: 1rem 0 1.5rem;
		color: var(--ink-soft);
	}

	.share-dialog__loading {
		display: flex;
		min-height: 120px;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		color: var(--ink-faint);
		font-size: 0.72rem;
	}

	.share-dialog__spinner {
		animation: share-spin 700ms linear infinite;
	}

	.share-dialog__link-label {
		display: block;
		margin-bottom: 0.45rem;
		color: var(--ink-soft);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.share-dialog__link-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.6rem;
	}

	.share-dialog__link-row .input {
		font-size: 0.72rem;
	}

	.share-dialog__hint {
		margin: 0.6rem 0 1.3rem;
		color: var(--success);
		font-size: 0.62rem;
		letter-spacing: 0.05em;
	}

	.share-dialog__revoke {
		width: 100%;
	}

	.share-dialog__notice {
		display: grid;
		gap: 0.25rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: 1rem;
		background: color-mix(in srgb, var(--paper-deep) 46%, transparent);
	}

	.share-dialog__notice strong {
		font-size: 0.95rem;
	}

	.share-dialog__notice span {
		color: var(--ink-soft);
		font-size: 0.85rem;
	}

	.share-dialog__create {
		width: 100%;
		margin-top: 0.9rem;
	}

	.share-dialog__error {
		display: grid;
		gap: 0.8rem;
		border-left: 3px solid var(--danger);
		padding-left: 1rem;
	}

	.share-dialog__error p {
		margin: 0;
		color: var(--danger);
	}

	@keyframes share-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 520px) {
		.share-dialog__link-row {
			grid-template-columns: 1fr;
		}
	}
</style>
