<script setup lang="ts">
	import {
		Archive,
		ArrowLeft,
		Bold,
		Code2,
		Heading2,
		List,
		Redo2,
		RotateCcw,
		Share2,
		Trash2,
		Undo2,
	} from "@lucide/vue";
	import StarterKit from "@tiptap/starter-kit";
	import { EditorContent, useEditor } from "@tiptap/vue-3";
	import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
	import type { Note } from "~~/shared/types/note";

	const props = withDefaults(defineProps<{ note: Note; archivePending?: boolean }>(), {
		archivePending: false,
	});
	const emit = defineEmits<{
		save: [value: { title: string; content: string; tagNames: string[] }];
		archive: [];
		restore: [];
		delete: [];
		share: [];
		back: [];
	}>();
	const title = ref(props.note.title);
	const tagsInput = ref(props.note.tags.join(", "));
	const content = ref(props.note.content);
	const lastSavedSignature = ref(`${props.note.title}\u0000${props.note.content}\u0000${props.note.tags.join("|")}`);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	const editor = useEditor({
		content: props.note.content,
		extensions: [StarterKit],
		editorProps: {
			attributes: {
				class: "ink-canvas",
				"aria-label": "Note content",
				"data-placeholder": "Follow the thought…",
			},
		},
		onUpdate: ({ editor: currentEditor }) => {
			content.value = currentEditor.getHTML();
			queueSave();
		},
	});
	const tags = computed(() =>
		tagsInput.value
			.split(",")
			.map(tag => tag.trim())
			.filter(Boolean)
	);
	const draftSignature = computed(() => `${title.value}\u0000${content.value}\u0000${tags.value.join("|")}`);
	const hasChanges = computed(() => draftSignature.value !== lastSavedSignature.value);
	const flush = () => {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = null;
		if (hasChanges.value) {
			lastSavedSignature.value = draftSignature.value;
			emit("save", { title: title.value, content: content.value, tagNames: tags.value });
		}
	};
	const queueSave = () => {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(flush, 650);
	};
	const goBack = () => {
		flush();
		emit("back");
	};
	const share = () => {
		flush();
		emit("share");
	};
	const archive = () => {
		flush();
		if (props.note.archivedAt) emit("restore");
		else emit("archive");
	};
	const date = computed(() =>
		new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
			new Date(props.note.createdAt)
		)
	);
	const wordCount = computed(
		() =>
			content.value
				.replace(/<[^>]+>/g, " ")
				.trim()
				.split(/\s+/)
				.filter(Boolean).length
	);
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			event.preventDefault();
			goBack();
		}
	};
	const onVisibilityChange = () => {
		if (document.visibilityState === "hidden") flush();
	};
	onMounted(() => {
		nextTick(() => editor.value?.commands.focus());
		window.addEventListener("keydown", handleKeydown);
		document.addEventListener("visibilitychange", onVisibilityChange);
	});
	onBeforeUnmount(() => {
		flush();
		window.removeEventListener("keydown", handleKeydown);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		editor.value?.destroy();
	});
</script>

<template>
	<article class="writing-room">
		<header class="writing-room__chrome mt-11">
			<div class="save-whisper" role="status">
				<span aria-hidden="true" />{{
					note.syncState === "local" ? "Held on this device" : "Every word is saved"
				}}
			</div>
			<div class="action-cluster">
				<button type="button" aria-label="Close note and return to the deck" @click="goBack">
					<ArrowLeft :size="18" aria-hidden="true" />
				</button>
				<button type="button" aria-label="Share note" @click="share">
					<Share2 :size="18" aria-hidden="true" />
				</button>
				<button
					type="button"
					:aria-label="note.archivedAt ? 'Restore note' : 'Archive note'"
					:aria-busy="archivePending"
					:disabled="archivePending"
					@click.stop="archive"
				>
					<RotateCcw v-if="note.archivedAt" :size="18" aria-hidden="true" /><Archive
						v-else
						:size="18"
						aria-hidden="true"
					/>
				</button>
				<button class="danger" type="button" aria-label="Delete note" @click="$emit('delete')">
					<Trash2 :size="18" aria-hidden="true" />
				</button>
			</div>
		</header>

		<aside class="ink-dock" aria-label="Text formatting">
			<button
				type="button"
				aria-label="Undo"
				:disabled="!editor?.can().undo()"
				@mousedown.prevent
				@click="editor?.chain().focus().undo().run()"
			>
				<Undo2 :size="18" aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-label="Redo"
				:disabled="!editor?.can().redo()"
				@mousedown.prevent
				@click="editor?.chain().focus().redo().run()"
			>
				<Redo2 :size="18" aria-hidden="true" />
			</button>
			<i aria-hidden="true" />
			<button
				type="button"
				aria-label="Heading"
				:aria-pressed="editor?.isActive('heading', { level: 2 })"
				@mousedown.prevent
				@click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
			>
				<Heading2 :size="18" aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-label="Bold"
				:aria-pressed="editor?.isActive('bold')"
				@mousedown.prevent
				@click="editor?.chain().focus().toggleBold().run()"
			>
				<Bold :size="18" aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-label="Bullet list"
				:aria-pressed="editor?.isActive('bulletList')"
				@mousedown.prevent
				@click="editor?.chain().focus().toggleBulletList().run()"
			>
				<List :size="18" aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-label="Code block"
				:aria-pressed="editor?.isActive('codeBlock')"
				@mousedown.prevent
				@click="editor?.chain().focus().toggleCodeBlock().run()"
			>
				<Code2 :size="18" aria-hidden="true" />
			</button>
		</aside>

		<div class="writing-room__edge" aria-hidden="true">
			<span>{{ date }}</span
			><span>{{ wordCount }} words</span>
		</div>
		<main class="writing-sheet">
			<label class="sr-only" :for="`title-${note.id}`">Note title</label>
			<input
				:id="`title-${note.id}`"
				v-model="title"
				class="writing-title"
				type="text"
				maxlength="240"
				placeholder="Name the thought, if you want"
				@input="queueSave"
				@blur="flush"
			/>
			<div class="writing-meta">
				<span>{{ date }}</span>
				<label
					><span class="sr-only">Tags separated by commas</span
					><input
						v-model="tagsInput"
						type="text"
						placeholder="Add a tag or two…"
						@input="queueSave"
						@blur="flush"
				/></label>
			</div>
			<EditorContent :editor="editor" />
		</main>
	</article>
</template>

<style scoped>
	.writing-room {
		position: fixed;
		z-index: 30;
		inset: 0;
		min-height: 100dvh;
		overflow: auto;
		background: var(--plum);
		color: oklch(0.955 0.025 84);
	}
	.writing-room::before {
		position: fixed;
		z-index: 3;
		inset: 0 0 auto;
		height: 6.5rem;
		background: color-mix(in oklch, var(--plum) 80%, transparent);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		content: "";
		pointer-events: none;
	}
	.writing-room__chrome {
		position: fixed;
		z-index: 4;
		inset: max(1rem, env(safe-area-inset-top)) clamp(1rem, 3vw, 2rem) auto;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 1rem;
		pointer-events: none;
	}
	.action-cluster,
	.save-whisper {
		pointer-events: auto;
	}
	.save-whisper {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		gap: 0.5rem;
		border-radius: 999px;
		padding: 0.55rem 0.8rem;
		background: oklch(0.955 0.025 84 / 0.11);
		color: oklch(0.88 0.03 84);
		font-size: 0.68rem;
		backdrop-filter: blur(18px);
	}
	.save-whisper span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--thread);
		box-shadow: 0 0 0 4px oklch(0.88 0.18 118 / 0.14);
	}
	.action-cluster {
		justify-self: end;
		display: flex;
		gap: 0.3rem;
		border-radius: 999px;
		padding: 0.3rem;
		background: oklch(0.955 0.025 84 / 0.11);
		backdrop-filter: blur(18px);
	}
	.action-cluster button,
	.ink-dock button {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: inherit;
		transition:
			background-color 130ms var(--ease-out-quick),
			color 130ms var(--ease-out-quick),
			scale 130ms var(--ease-out-quick);
	}
	.action-cluster button:hover,
	.ink-dock button:hover,
	.ink-dock button[aria-pressed="true"] {
		background: oklch(0.955 0.025 84);
		color: var(--plum);
	}
	.action-cluster button:active,
	.ink-dock button:active {
		scale: 0.96;
	}
	.action-cluster button:disabled {
		cursor: wait;
		opacity: 0.48;
		pointer-events: auto;
	}
	.action-cluster .danger:hover {
		color: var(--danger);
	}
	.ink-dock {
		position: fixed;
		z-index: 4;
		inset: 50% clamp(1rem, 3vw, 2rem) auto auto;
		display: grid;
		gap: 0.15rem;
		translate: 0 -50%;
		border-radius: 999px;
		padding: 0.35rem;
		background: var(--thread);
		color: var(--plum);
		box-shadow: 0 20px 50px oklch(0.1 0.03 303 / 0.32);
	}
	.ink-dock i {
		width: 24px;
		height: 1px;
		margin: 0.25rem auto;
		background: currentColor;
		opacity: 0.28;
	}
	.ink-dock button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.writing-room__edge {
		position: fixed;
		z-index: 2;
		inset: 50% auto auto 1rem;
		display: flex;
		gap: 2.5rem;
		color: oklch(0.75 0.035 84);
		font-size: 0.62rem;
		font-weight: 650;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		rotate: -90deg;
		translate: -43% -50%;
	}
	.writing-sheet {
		position: relative;
		z-index: 1;
		width: min(760px, calc(100% - 12rem));
		min-height: 100dvh;
		margin: 0 auto;
		padding: clamp(9rem, 16vh, 12rem) clamp(1rem, 5vw, 4rem) 12rem;
	}
	.writing-title {
		display: block;
		width: 100%;
		border: 0;
		padding: 0;
		background: transparent;
		color: inherit;
		font-family: var(--font-serif);
		font-size: clamp(2.9rem, 6.2vw, 5.8rem);
		font-weight: 590;
		letter-spacing: -0.065em;
		line-height: 0.86;
		text-wrap: balance;
	}
	.writing-title:focus {
		outline: 0;
		box-shadow: none;
	}
	.writing-title::placeholder {
		color: oklch(0.7 0.055 303);
	}
	.writing-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin: 2.2rem 0 4rem;
		border-block-start: 1px solid oklch(0.955 0.025 84 / 0.2);
		padding-block-start: 0.8rem;
		color: oklch(0.75 0.035 84);
		font-size: 0.7rem;
	}
	.writing-meta label {
		width: min(330px, 55%);
	}
	.writing-meta input {
		width: 100%;
		border: 0;
		padding: 0.35rem 0;
		background: transparent;
		color: var(--thread);
		font-size: 0.72rem;
		text-align: end;
	}
	.writing-meta input:focus-visible {
		outline: 0;
		box-shadow: 0 2px 0 var(--signal);
	}
	:deep(.ink-canvas) {
		min-height: 55dvh;
		max-width: 68ch;
		color: oklch(0.92 0.025 84);
		font-family: var(--font-serif);
		font-size: clamp(1.08rem, 1.35vw, 1.28rem);
		font-weight: 350;
		line-height: 1.62;
	}
	:deep(.ink-canvas:focus) {
		outline: 0;
	}
	:deep(.ink-canvas:focus-visible) {
		outline: 0;
		box-shadow: none;
	}
	:deep(.ink-canvas p.is-editor-empty:first-child::before) {
		float: left;
		height: 0;
		color: oklch(0.68 0.045 303);
		content: attr(data-placeholder);
		pointer-events: none;
	}
	:deep(.ink-canvas p) {
		margin: 0 0 1.15em;
	}
	:deep(.ink-canvas h2) {
		margin: 1.5em 0 0.5em;
		color: var(--thread);
		font-size: 2em;
		font-weight: 620;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	:deep(.ink-canvas ul) {
		padding-inline-start: 1.25em;
	}
	:deep(.ink-canvas pre) {
		overflow-x: auto;
		border-radius: 20px 20px 5px 20px;
		padding: 1.2rem;
		background: oklch(0.14 0.035 303);
		color: var(--thread);
		font-family: var(--font-mono);
		font-size: 0.78em;
	}
	@media (max-width: 760px) {
		.writing-room__chrome {
			grid-template-columns: auto 1fr;
		}
		.save-whisper {
			display: none;
		}
		.action-cluster {
			justify-self: end;
		}
		.writing-room__edge {
			display: none;
		}
		.writing-sheet {
			width: 100%;
			padding: 8rem 1.2rem 10rem;
		}
		.writing-title {
			font-size: clamp(3.2rem, 17vw, 6rem);
		}
		.ink-dock {
			inset: auto 50% max(1rem, env(safe-area-inset-bottom)) auto;
			display: flex;
			translate: 50% 0;
		}
		.ink-dock i {
			width: 1px;
			height: 24px;
			margin: auto 0.2rem;
		}
		.writing-meta {
			align-items: start;
			flex-direction: column;
			margin-bottom: 3rem;
		}
		.writing-meta label {
			width: 100%;
		}
		.writing-meta input {
			text-align: start;
		}
		.action-cluster button {
			width: 40px;
			height: 40px;
		}
	}
	@media (prefers-reduced-transparency: reduce) {
		.save-whisper,
		.action-cluster {
			background: var(--plum);
			backdrop-filter: none;
		}
		.writing-room::before {
			background: var(--plum);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.action-cluster button,
		.ink-dock button {
			transition: opacity 120ms ease-out;
		}
	}
</style>
