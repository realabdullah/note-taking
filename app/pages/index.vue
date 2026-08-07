<script setup lang="ts">
	import { Archive, ArrowUpRight, Check, Feather, Plus, Search, Sparkles, X } from "@lucide/vue";
	import { authClient } from "~/lib/auth-client";
	import type { Note } from "~~/shared/types/note";

	definePageMeta({ middleware: "auth" });
	const ogImageUrl = new URL("/og-image.svg", useRequestURL().origin).toString();
	useSeoMeta({
		title: "Fieldnote · A living place for thoughts",
		description: "A quiet, local-first notebook that follows you across devices.",
		ogType: "website",
		ogImage: ogImageUrl,
		ogImageAlt: "Fieldnote — a quiet place for thoughts",
		twitterCard: "summary_large_image",
	});

	type Space = "write" | "library" | "search" | "archive";
	type ViewTransition = { finished: Promise<void> };
	type ViewTransitionDocument = Document & {
		startViewTransition?: (update: () => void | Promise<void>) => ViewTransition;
	};

	const route = useRoute();
	const router = useRouter();
	const session = authClient.useSession();
	const { activeNotes, archivedNotes, createNote, updateNote, changeArchiveState, deleteNote, isReady } = useNotes();
	const capture = ref("");
	const captureField = ref<HTMLTextAreaElement | null>(null);
	const draftId = ref<string | null>(null);
	const searchQuery = ref(typeof route.query.q === "string" ? route.query.q : "");
	const shareDialogOpen = ref(false);
	const archivePending = ref(false);
	const archiveFeedback = ref<string | null>(null);
	const actionTransitionId = ref<string | null>(null);
	const actionTransitionTarget = ref<"archive" | "library" | null>(null);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let selectedNoteSave = Promise.resolve();

	const validSpaces: Space[] = ["write", "library", "search", "archive"];
	const space = computed<Space>(() => {
		const value = typeof route.query.space === "string" ? route.query.space : "write";
		return validSpaces.includes(value as Space) ? (value as Space) : "write";
	});
	const selectedId = computed(() => (typeof route.query.note === "string" ? route.query.note : null));
	const selectedNote = computed(() =>
		[...activeNotes.value, ...archivedNotes.value].find(note => note.id === selectedId.value)
	);
	const visibleNotes = computed(() => (space.value === "archive" ? archivedNotes.value : activeNotes.value));
	const searchResults = computed(() => {
		const query = searchQuery.value.trim().toLowerCase();
		if (!query) return activeNotes.value;
		return activeNotes.value.filter(note =>
			[note.title, note.content, ...note.tags].some(value => value.toLowerCase().includes(query))
		);
	});
	const deckNotes = computed(() => (space.value === "search" ? searchResults.value : visibleNotes.value));
	const firstName = computed(() => session.value.data?.user.name?.split(" ")[0] || "there");

	const stripHtml = (value: string) =>
		value
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
	const titleFor = (note: Note) => note.title.trim() || stripHtml(note.content).slice(0, 72) || "Untitled thought";
	const excerptFor = (note: Note) => stripHtml(note.content) || "A blank page with room to surprise you.";
	const toneFor = (index: number) => ["persimmon", "citron", "lilac", "paper"][index % 4];
	const noteTransitionName = (id: string) => `note-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

	const transition = async (update: () => void | Promise<void>) => {
		if (!import.meta.client || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			await update();
			await nextTick();
			return;
		}
		const transitionDocument = document as ViewTransitionDocument;
		if (transitionDocument.startViewTransition) {
			const viewTransition = transitionDocument.startViewTransition(async () => {
				await update();
				await nextTick();
			});
			await viewTransition.finished;
			return;
		}
		await update();
		await nextTick();
	};

	const setQuery = (query: Record<string, string>) =>
		transition(async () => {
			await router.replace({ path: "/", query });
		});

	const openSpace = async (nextSpace: Space) => {
		await setQuery(nextSpace === "write" ? {} : { space: nextSpace });
		if (nextSpace === "write") nextTick(() => captureField.value?.focus());
	};
	const openNote = (note: Note) => setQuery({ note: note.id });
	const closeNote = () => setQuery(space.value === "write" ? { space: "library" } : { space: space.value });

	const saveCapture = async () => {
		const text = capture.value.trim();
		if (!text) return;
		if (!draftId.value) {
			const note = await createNote({ content: `<p>${text.replace(/\n/g, "</p><p>")}</p>` });
			draftId.value = note.id;
			return;
		}
		await updateNote(draftId.value, { content: `<p>${text.replace(/\n/g, "</p><p>")}</p>` });
	};
	const queueCapture = () => {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => void saveCapture(), 500);
	};
	const expandCapture = async () => {
		await saveCapture();
		if (!draftId.value) {
			const note = await createNote();
			draftId.value = note.id;
		}
		const note = activeNotes.value.find(item => item.id === draftId.value);
		if (note) openNote(note);
	};
	const createBlankNote = async () => openNote(await createNote());
	const saveSelectedNote = (value: { title: string; content: string; tagNames: string[] }) => {
		const noteId = selectedNote.value?.id;
		if (!noteId) return;
		selectedNoteSave = selectedNoteSave.then(() => updateNote(noteId, value));
	};

	const archiveSelected = async () => {
		const noteId = selectedNote.value?.id;
		if (!noteId || archivePending.value) return;
		archivePending.value = true;
		archiveFeedback.value = null;

		try {
			await selectedNoteSave;
			const { syncPromise } = await changeArchiveState(noteId, true);
			actionTransitionId.value = noteId;
			actionTransitionTarget.value = "archive";
			await transition(async () => {
				await router.replace({ path: "/", query: { space: "library" } });
			});

			if (!(await syncPromise) && navigator.onLine) {
				archiveFeedback.value = "Archived on this device. Server sync will retry automatically.";
			}
		} catch (error) {
			archiveFeedback.value = error instanceof Error ? error.message : "The note could not be archived.";
		} finally {
			actionTransitionId.value = null;
			actionTransitionTarget.value = null;
			archivePending.value = false;
		}
	};
	const restoreSelected = async () => {
		const noteId = selectedNote.value?.id;
		if (!noteId || archivePending.value) return;
		archivePending.value = true;
		archiveFeedback.value = null;

		try {
			await selectedNoteSave;
			const { syncPromise } = await changeArchiveState(noteId, false);
			actionTransitionId.value = noteId;
			actionTransitionTarget.value = "library";
			await transition(async () => {
				await router.replace({ path: "/", query: { space: "archive" } });
			});

			if (!(await syncPromise) && navigator.onLine) {
				archiveFeedback.value = "Restored on this device. Server sync will retry automatically.";
			}
		} catch (error) {
			archiveFeedback.value = error instanceof Error ? error.message : "The note could not be restored.";
		} finally {
			actionTransitionId.value = null;
			actionTransitionTarget.value = null;
			archivePending.value = false;
		}
	};
	const removeSelected = async () => {
		if (!selectedNote.value) return;
		const accepted = window.confirm("Delete this note? This removes it from your notebook.");
		if (!accepted) return;
		await deleteNote(selectedNote.value.id);
		closeNote();
	};

	watch(space, value => {
		if (value === "search") nextTick(() => document.querySelector<HTMLInputElement>("#living-search")?.focus());
	});
	onBeforeUnmount(() => {
		if (saveTimer) clearTimeout(saveTimer);
		void saveCapture();
	});
</script>

<template>
	<div class="living-desk" :data-space="space">
		<div class="desk-atmosphere" aria-hidden="true"><i /><i /><i /></div>

		<NoteEditor
			v-if="selectedNote"
			:key="selectedNote.id"
			:note="selectedNote"
			:archive-pending="archivePending"
			:style="{ viewTransitionName: noteTransitionName(selectedNote.id) }"
			@save="saveSelectedNote"
			@archive="archiveSelected"
			@restore="restoreSelected"
			@delete="removeSelected"
			@share="shareDialogOpen = true"
			@back="closeNote"
		/>

		<template v-else>
			<section
				v-if="space === 'write'"
				:key="space"
				class="capture-world"
				style="view-transition-name: workspace"
			>
				<div class="capture-world__intro">
					<p><Sparkles :size="15" aria-hidden="true" /> Hi {{ firstName }}. Your desk is open.</p>
					<h1>Put it here<br /><em>before it disappears.</em></h1>
				</div>

				<div class="thought-pool">
					<span class="thought-pool__index" aria-hidden="true">✦</span>
					<label class="sr-only" for="quick-capture">Write a thought</label>
					<textarea
						id="quick-capture"
						ref="captureField"
						v-model="capture"
						placeholder="A thought, a question, a loose thread…"
						@input="queueCapture"
						@keydown.meta.enter.prevent="expandCapture"
						@keydown.ctrl.enter.prevent="expandCapture"
						@blur="saveCapture"
					/>
					<div class="thought-pool__footer">
						<span aria-live="polite">{{
							draftId ? "Held safely on this device" : "No title. No ceremony."
						}}</span>
						<button type="button" :disabled="!capture.trim()" @click="expandCapture">
							Open the thought <ArrowUpRight :size="18" aria-hidden="true" />
						</button>
					</div>
				</div>

				<div class="deck-peek">
					<button class="deck-peek__label" type="button" @click="openSpace('library')">
						<span>{{ activeNotes.length }}</span> thoughts are within reach
					</button>
					<div v-if="activeNotes.length" class="mini-deck" aria-label="Recent notes">
						<button
							v-for="(note, index) in activeNotes.slice(0, 3)"
							:key="note.id"
							type="button"
							:class="`mini-note mini-note--${toneFor(index)}`"
							:style="{ viewTransitionName: noteTransitionName(note.id) }"
							@click="openNote(note)"
						>
							<span>{{ titleFor(note) }}</span>
						</button>
					</div>
				</div>
			</section>

			<section v-else :key="space" class="deck-world" style="view-transition-name: workspace">
				<header class="deck-world__header">
					<div>
						<p>
							{{
								space === "search"
									? "Pull a thread"
									: space === "archive"
										? "Sleeping thoughts"
										: "Your thought deck"
							}}
						</p>
						<h1>
							{{
								space === "search"
									? "Find the phrase that stayed."
									: space === "archive"
										? "Still here, just quieter."
										: "Shuffle through what matters."
							}}
						</h1>
					</div>
					<div class="mode-switcher" aria-label="Change workspace view">
						<button
							type="button"
							:aria-pressed="space === 'library'"
							:style="
								actionTransitionTarget === 'library' && actionTransitionId
									? { viewTransitionName: noteTransitionName(actionTransitionId) }
									: undefined
							"
							@click="openSpace('library')"
						>
							<Check v-if="space === 'library'" :size="16" aria-hidden="true" />Browse
						</button>
						<button type="button" :aria-pressed="space === 'search'" @click="openSpace('search')">
							<Check v-if="space === 'search'" :size="16" aria-hidden="true" />
							<Search v-else :size="16" aria-hidden="true" />Find
						</button>
						<button
							type="button"
							:aria-pressed="space === 'archive'"
							:style="
								actionTransitionTarget === 'archive' && actionTransitionId
									? { viewTransitionName: noteTransitionName(actionTransitionId) }
									: undefined
							"
							@click="openSpace('archive')"
						>
							<Check v-if="space === 'archive'" :size="16" aria-hidden="true" />
							<Archive v-else :size="16" aria-hidden="true" />Archive
						</button>
					</div>
				</header>

				<div v-if="space === 'search'" class="living-search">
					<Search :size="26" aria-hidden="true" />
					<label class="sr-only" for="living-search">Search your notes</label>
					<input
						id="living-search"
						v-model="searchQuery"
						type="search"
						placeholder="Type a word, tag, or half-memory…"
					/>
					<button v-if="searchQuery" type="button" aria-label="Clear search" @click="searchQuery = ''">
						<X :size="18" aria-hidden="true" />
					</button>
				</div>

				<div v-if="deckNotes.length" class="note-deck" aria-label="Notes">
					<button
						v-for="(note, index) in deckNotes"
						:key="note.id"
						type="button"
						:class="`note-fragment note-fragment--${toneFor(index)}`"
						:style="{
							'--tilt': `${[-2.2, 1.1, -0.6, 2][index % 4]}deg`,
							viewTransitionName: noteTransitionName(note.id),
						}"
						@click="openNote(note)"
					>
						<span class="note-fragment__number">{{ String(index + 1).padStart(2, "0") }}</span>
						<strong>{{ titleFor(note) }}</strong>
						<small>{{ excerptFor(note) }}</small>
						<span class="note-fragment__meta"
							>{{ note.tags[0] || "unfiled" }} <ArrowUpRight :size="15" aria-hidden="true"
						/></span>
					</button>
				</div>
				<div v-else-if="isReady" class="empty-deck">
					<Feather :size="36" aria-hidden="true" />
					<h2>
						{{
							searchQuery
								? `Nothing echoes “${searchQuery}”`
								: space === "archive"
									? "The archive is empty."
									: "The deck is waiting."
						}}
					</h2>
					<p>
						{{
							searchQuery
								? "Try a shorter phrase or return to the full deck."
								: "Write the first thing you do not want to lose."
						}}
					</p>
				</div>

				<button class="floating-compose" type="button" @click="createBlankNote">
					<Plus :size="21" aria-hidden="true" /><span>Start a blank thought</span>
				</button>
			</section>
		</template>

		<p v-if="archiveFeedback" class="action-feedback" role="alert">{{ archiveFeedback }}</p>

		<NoteShareDialog
			v-if="selectedNote"
			:note-id="selectedNote.id"
			:open="shareDialogOpen"
			:sync-state="selectedNote.syncState"
			@close="shareDialogOpen = false"
		/>
	</div>
</template>

<style scoped>
	.living-desk {
		position: relative;
		min-height: 100dvh;
		overflow: clip;
	}
	.desk-atmosphere {
		position: fixed;
		z-index: -1;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}
	.desk-atmosphere::after {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
		content: "";
		opacity: 0.11;
		mix-blend-mode: multiply;
	}
	.desk-atmosphere i {
		position: absolute;
		border-radius: 50%;
		filter: blur(1px);
	}
	.desk-atmosphere i:nth-child(1) {
		width: 32vw;
		height: 32vw;
		inset: 8% -10% auto auto;
		background: var(--thread);
		opacity: 0.52;
	}
	.desk-atmosphere i:nth-child(2) {
		width: 22vw;
		height: 22vw;
		inset: auto auto -8% 8%;
		background: var(--signal);
		opacity: 0.24;
	}
	.desk-atmosphere i:nth-child(3) {
		width: 10vw;
		height: 10vw;
		inset: 21% auto auto 9%;
		background: var(--lilac);
		opacity: 0.5;
	}
	.capture-world {
		min-height: 100dvh;
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
		align-items: center;
		gap: clamp(2rem, 6vw, 7rem);
		padding: clamp(7rem, 12vh, 9rem) clamp(1.25rem, 6vw, 7rem) 8rem;
	}
	.capture-world__intro {
		align-self: start;
		padding-block-start: 4vh;
	}
	.capture-world__intro p {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 1.5rem;
		color: var(--ink-soft);
		font-size: 0.78rem;
		font-weight: 650;
	}
	.capture-world__intro h1 {
		max-width: 12ch;
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3.4rem, 7.7vw, 8.5rem);
		font-weight: 600;
		letter-spacing: -0.065em;
		line-height: 0.83;
		text-wrap: balance;
	}
	.capture-world__intro em {
		color: var(--signal);
		font-weight: 350;
	}
	.thought-pool {
		position: relative;
		align-self: center;
		min-height: min(58dvh, 610px);
		border-radius: 48px 48px 48px 12px;
		padding: clamp(1.25rem, 3vw, 2.25rem);
		background: var(--plum);
		color: oklch(0.96 0.025 84);
		box-shadow: 0 34px 90px oklch(0.18 0.06 303 / 0.3);
		rotate: 1.2deg;
		transition:
			rotate 200ms var(--ease-out-quick),
			scale 200ms var(--ease-out-quick);
	}
	.thought-pool:focus-within {
		rotate: 0deg;
		scale: 1.012;
	}
	.thought-pool__index {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border-radius: 50%;
		background: var(--thread);
		color: var(--plum);
	}
	.thought-pool textarea {
		display: block;
		min-height: min(38dvh, 410px);
		width: 100%;
		resize: none;
		border: 0;
		padding: clamp(1.5rem, 4vw, 3rem) 0.25rem 1rem;
		background: transparent;
		color: inherit;
		font-family: var(--font-serif);
		font-size: clamp(1.65rem, 3.7vw, 3.8rem);
		font-weight: 360;
		letter-spacing: -0.025em;
		line-height: 1.12;
	}
	.thought-pool textarea:focus {
		outline: 0;
	}
	.thought-pool textarea::placeholder {
		color: oklch(0.82 0.04 303);
		opacity: 0.54;
	}
	.thought-pool__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.thought-pool__footer > span {
		color: oklch(0.8 0.035 84);
		font-size: 0.7rem;
	}
	.thought-pool__footer button {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.5rem;
		border: 0;
		border-radius: 999px;
		padding: 0.7rem 1rem;
		background: var(--signal);
		color: oklch(0.18 0.05 303);
		font-size: 0.75rem;
		font-weight: 750;
		transition: scale 130ms var(--ease-out-quick);
	}
	.thought-pool__footer button:active:not(:disabled) {
		scale: 0.96;
	}
	.thought-pool__footer button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.deck-peek {
		position: absolute;
		inset: auto clamp(1rem, 4vw, 4rem) 1rem;
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
	}
	.deck-peek__label {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.7rem;
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--ink-soft);
		font-size: 0.73rem;
	}
	.deck-peek__label span {
		font-family: var(--font-serif);
		font-size: 2.2rem;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.mini-deck {
		position: relative;
		width: min(360px, 42vw);
		height: 82px;
	}
	.mini-note {
		position: absolute;
		inset-block-end: 0;
		width: 180px;
		height: 76px;
		overflow: hidden;
		border: 0;
		border-radius: 18px 18px 5px 18px;
		padding: 1rem;
		color: var(--plum);
		font-family: var(--font-serif);
		font-size: 0.88rem;
		text-align: start;
		box-shadow: var(--shadow-float);
		transition:
			translate 180ms var(--ease-out-quick),
			rotate 180ms var(--ease-out-quick);
	}
	.mini-note:nth-child(1) {
		z-index: 3;
		inset-inline-end: 0;
		rotate: 2deg;
	}
	.mini-note:nth-child(2) {
		z-index: 2;
		inset-inline-end: 70px;
		rotate: -5deg;
	}
	.mini-note:nth-child(3) {
		z-index: 1;
		inset-inline-end: 135px;
		rotate: 4deg;
	}
	.mini-note:hover {
		z-index: 4;
		translate: 0 -12px;
		rotate: 0deg;
	}
	.mini-note:active {
		scale: 0.96;
	}
	.mini-note--persimmon,
	.note-fragment--persimmon {
		background: var(--signal);
	}
	.mini-note--citron,
	.note-fragment--citron {
		background: var(--thread);
	}
	.mini-note--lilac,
	.note-fragment--lilac {
		background: var(--lilac);
	}
	.mini-note--paper,
	.note-fragment--paper {
		background: var(--surface-raised);
	}
	.deck-world {
		min-height: 100dvh;
		padding: clamp(7rem, 13vh, 9rem) clamp(1rem, 5vw, 5rem) 8rem;
	}
	.deck-world__header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2rem;
		max-width: 1500px;
		margin: 0 auto clamp(2.5rem, 5vw, 5rem);
	}
	.deck-world__header p {
		margin: 0 0 0.6rem;
		color: var(--signal);
		font-size: 0.76rem;
		font-weight: 750;
	}
	.deck-world__header h1 {
		max-width: 13ch;
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3rem, 6.8vw, 7.2rem);
		font-weight: 540;
		letter-spacing: -0.06em;
		line-height: 0.91;
		text-wrap: balance;
	}
	.mode-switcher {
		display: flex;
		flex-wrap: wrap;
		justify-content: end;
		gap: 0.45rem;
	}
	.mode-switcher button {
		display: inline-flex;
		min-height: 42px;
		align-items: center;
		gap: 0.4rem;
		border: 0;
		border-radius: 999px;
		padding: 0.65rem 0.85rem;
		background: color-mix(in oklch, var(--surface) 75%, transparent);
		color: var(--ink-soft);
		font-size: 0.7rem;
		font-weight: 700;
		box-shadow: 0 1px 0 oklch(1 0 0 / 0.4) inset;
	}
	.mode-switcher button[aria-pressed="true"] {
		color: var(--ink);
		font-weight: 800;
	}
	.mode-switcher button:active {
		scale: 0.96;
	}
	.living-search {
		display: grid;
		max-width: 1500px;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		margin: -1rem auto 3rem;
		border-block-end: 2px solid var(--ink);
		padding: 1rem 0.25rem;
	}
	.living-search input {
		min-width: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		font-family: var(--font-serif);
		font-size: clamp(1.5rem, 4vw, 3.4rem);
		letter-spacing: -0.035em;
	}
	.living-search input:focus {
		outline: 0;
		box-shadow: none;
	}
	.living-search input:focus-visible {
		box-shadow: none;
	}
	.living-search button {
		display: grid;
		width: 44px;
		height: 44px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
		color: var(--canvas);
	}
	.note-deck {
		display: grid;
		max-width: 1500px;
		grid-template-columns: repeat(12, 1fr);
		grid-auto-flow: dense;
		gap: clamp(0.8rem, 1.6vw, 1.4rem);
		margin: 0 auto;
	}
	.note-fragment {
		position: relative;
		grid-column: span 4;
		display: flex;
		min-height: clamp(260px, 29vw, 410px);
		flex-direction: column;
		overflow: hidden;
		border: 0;
		border-radius: 38px 38px 8px 38px;
		padding: clamp(1.2rem, 2.5vw, 2rem);
		color: var(--plum);
		text-align: start;
		rotate: var(--tilt);
		box-shadow: 0 18px 50px oklch(0.18 0.06 303 / 0.16);
		transition:
			translate 180ms var(--ease-out-quick),
			rotate 180ms var(--ease-out-quick),
			box-shadow 180ms var(--ease-out-quick);
	}
	.note-fragment:nth-child(5n + 1) {
		grid-column: span 5;
	}
	.note-fragment:nth-child(5n + 2) {
		grid-column: span 7;
	}
	.note-fragment:hover {
		z-index: 2;
		translate: 0 -10px;
		rotate: 0deg;
		box-shadow: 0 28px 70px oklch(0.18 0.06 303 / 0.24);
	}
	.note-fragment:active {
		scale: 0.96;
	}
	.note-fragment__number {
		align-self: end;
		font-size: 0.68rem;
		font-weight: 750;
		font-variant-numeric: tabular-nums;
	}
	.note-fragment strong {
		max-width: 12ch;
		margin: auto 0 1rem;
		font-family: var(--font-serif);
		font-size: clamp(1.7rem, 3vw, 3.5rem);
		font-weight: 620;
		letter-spacing: -0.045em;
		line-height: 0.98;
		text-wrap: balance;
	}
	.note-fragment small {
		display: -webkit-box;
		max-width: 52ch;
		overflow: hidden;
		font-size: 0.76rem;
		line-height: 1.5;
		opacity: 0.72;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
	.note-fragment__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.2rem;
		border-block-start: 1px solid currentColor;
		padding-top: 0.7rem;
		font-size: 0.68rem;
		font-weight: 700;
		opacity: 0.75;
	}
	.floating-compose {
		position: fixed;
		z-index: 12;
		inset: auto clamp(1rem, 3vw, 2rem) max(1rem, env(safe-area-inset-bottom));
		display: inline-flex;
		min-height: 52px;
		align-items: center;
		gap: 0.55rem;
		border: 0;
		border-radius: 999px;
		padding: 0.8rem 1rem;
		background: var(--signal);
		color: var(--plum);
		font-size: 0.76rem;
		font-weight: 750;
		box-shadow: 0 18px 50px oklch(0.18 0.06 303 / 0.3);
	}
	.floating-compose:active {
		scale: 0.96;
	}
	.action-feedback {
		position: fixed;
		z-index: 60;
		inset: auto 1rem max(1rem, env(safe-area-inset-bottom));
		width: min(420px, calc(100vw - 2rem));
		margin: 0 auto;
		border-radius: var(--radius-sm);
		padding: 0.85rem 1rem;
		background: var(--ink);
		color: var(--canvas);
		font-size: 0.78rem;
		font-weight: 650;
		text-align: center;
	}
	.empty-deck {
		max-width: 700px;
		margin: 10vh auto;
		text-align: center;
	}
	.empty-deck h2 {
		margin: 1rem 0 0.5rem;
		font-family: var(--font-serif);
		font-size: clamp(2rem, 5vw, 4.5rem);
		line-height: 1;
	}
	.empty-deck p {
		color: var(--ink-soft);
	}
	@media (max-width: 900px) {
		.capture-world {
			grid-template-columns: 1fr;
			align-content: center;
			padding-block-start: 7rem;
		}
		.capture-world__intro {
			padding: 0;
		}
		.capture-world__intro h1 {
			max-width: 10ch;
			font-size: clamp(3.2rem, 13vw, 7rem);
		}
		.thought-pool {
			min-height: auto;
			rotate: 0deg;
		}
		.thought-pool textarea {
			min-height: 240px;
		}
		.deck-peek {
			position: relative;
			inset: auto;
			margin-top: 1.5rem;
		}
		.note-fragment {
			grid-column: span 6 !important;
		}
	}
	@media (max-width: 620px) {
		.capture-world {
			display: block;
			padding: 7rem 1rem 8rem;
		}
		.capture-world__intro h1 {
			font-size: clamp(3.4rem, 16vw, 5.5rem);
		}
		.thought-pool {
			margin-top: 2.5rem;
			border-radius: 32px 32px 32px 8px;
		}
		.thought-pool__footer > span {
			display: none;
		}
		.thought-pool__footer {
			justify-content: flex-end;
		}
		.mini-deck {
			display: none;
		}
		.deck-world {
			padding-inline: 1rem;
		}
		.deck-world__header {
			align-items: start;
			flex-direction: column;
		}
		.mode-switcher {
			justify-content: start;
		}
		.note-deck {
			display: flex;
			overflow-x: auto;
			gap: 0.9rem;
			margin-inline: -1rem;
			padding: 0.5rem 1rem 1.5rem;
			scroll-snap-type: x mandatory;
		}
		.note-fragment {
			min-width: calc(100vw - 3rem);
			min-height: 52dvh;
			rotate: 0deg;
			scroll-snap-align: center;
		}
		.note-deck::after {
			min-width: 1px;
			content: "";
		}
		.floating-compose span {
			display: none;
		}
		.floating-compose {
			width: 52px;
			justify-content: center;
			padding: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.thought-pool,
		.mini-note,
		.note-fragment,
		.floating-compose {
			transition: opacity 120ms ease-out;
			rotate: 0deg;
			transform: none;
		}
	}
</style>
