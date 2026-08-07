<script setup lang="ts">
	import { FileText } from "@lucide/vue";
	import type { PublicNote } from "~~/shared/types/note-share";

	definePageMeta({ layout: false });

	const route = useRoute();
	const token = computed(() => String(route.params.token));
	const requestOrigin = useRequestURL().origin;
	const ogImageUrl = computed(() => new URL(`/og/share/${token.value}.svg`, requestOrigin).toString());
	const { data, error } = await useFetch<{ note: PublicNote }>(() => `/api/public/notes/${token.value}`);

	if (error.value && import.meta.server) {
		const event = useRequestEvent();
		if (event) setResponseStatus(event, 404);
	}

	useSeoMeta({
		title: () => (data.value?.note.title ? `${data.value.note.title} · Fieldnote` : "Shared note · Fieldnote"),
		description: "A note shared with you on Fieldnote.",
		ogType: "article",
		ogImage: () => ogImageUrl.value,
		ogImageAlt: "Fieldnote — a quiet place for thoughts",
		twitterCard: "summary_large_image",
		robots: "noindex, nofollow, noarchive",
	});

	useHead({
		meta: [{ name: "referrer", content: "no-referrer" }],
	});

	const formattedDate = computed(() => {
		if (!data.value?.note.createdAt) return "";
		return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
			new Date(data.value.note.createdAt)
		);
	});
</script>

<template>
	<main class="shared-page">
		<header class="shared-page__header">
			<NuxtLink class="shared-page__brand" to="/">
				<span class="shared-page__brand-mark">F</span>
				<span>
					<strong>Fieldnote</strong>
					<small class="mono">SHARED NOTE</small>
				</span>
			</NuxtLink>
			<span class="shared-page__read-only mono">READ ONLY</span>
		</header>

		<article v-if="data?.note" class="shared-note paper">
			<div class="shared-note__page">
				<p class="eyebrow">Shared with you</p>
				<h1>{{ data.note.title || "Untitled note" }}</h1>
				<div class="shared-note__rule">
					<span class="mono">{{ formattedDate }}</span>
					<span aria-hidden="true">✦</span>
					<ul v-if="data.note.tags.length" aria-label="Tags">
						<li v-for="tag in data.note.tags" :key="tag" class="mono">{{ tag }}</li>
					</ul>
					<span v-else class="mono">FIELDNOTE</span>
				</div>
				<!-- Content is sanitized on the server before it reaches this public page. -->
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div class="shared-note__content" v-html="data.note.content" />
			</div>
		</article>

		<section v-else class="shared-missing paper">
			<FileText :size="30" aria-hidden="true" />
			<p class="eyebrow">Link unavailable</p>
			<h1>This note is no longer shared.</h1>
			<p>The owner may have revoked the link, or the address may be incorrect.</p>
		</section>
	</main>
</template>

<style scoped>
	.shared-page {
		min-height: 100dvh;
		padding: 0.75rem clamp(1rem, 4vw, 4rem) 3rem;
	}

	.shared-page__header {
		display: flex;
		width: min(1180px, 100%);
		min-height: 52px;
		align-items: center;
		justify-content: space-between;
		margin: 0 auto 0.75rem;
	}

	.shared-page__brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.shared-page__brand-mark {
		display: grid;
		width: 32px;
		height: 32px;
		place-items: center;
		border-radius: 50% 50% 48% 52%;
		background: var(--ink);
		color: var(--paper);
		font-size: 0.95rem;
		transform: rotate(-4deg);
	}

	.shared-page__brand > span:last-child {
		display: grid;
		line-height: 1.1;
	}

	.shared-page__brand small,
	.shared-page__read-only {
		margin-top: 0.2rem;
		color: var(--ink-faint);
		font-size: 0.59rem;
		letter-spacing: 0.11em;
	}

	.shared-page__read-only {
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.35rem 0.6rem;
	}

	.shared-note {
		width: min(1180px, 100%);
		margin: 0 auto;
		overflow: hidden;
	}

	.shared-note__page {
		width: min(1000px, 100%);
		margin: 0 auto;
		padding: clamp(2rem, 4vw, 2.75rem) clamp(1.2rem, 5vw, 4.5rem) clamp(3rem, 7vw, 5rem);
	}

	.shared-note h1,
	.shared-missing h1 {
		margin: 0.45rem 0 0;
		font-size: clamp(2rem, 4.75vw, 3.3rem);
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.04;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.shared-note__rule {
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr);
		align-items: center;
		gap: 0.75rem;
		border-top: 1px solid var(--line-strong);
		border-bottom: 1px solid var(--line);
		margin-top: 1.25rem;
		padding: 0.6rem 0;
		color: var(--ink-faint);
		font-size: 0.66rem;
	}

	.shared-note__rule ul {
		display: flex;
		min-width: 0;
		flex-wrap: wrap;
		gap: 0.35rem 0.7rem;
		margin: 0;
		padding: 0;
		color: var(--olive);
		list-style: none;
	}

	.shared-note__content {
		padding-top: 1.25rem;
		font-family: var(--font-serif);
		font-size: clamp(1.08rem, 1.35vw, 1.28rem);
		font-weight: 350;
		line-height: 1.62;
		overflow-wrap: anywhere;
	}

	:deep(.shared-note__content p) {
		margin: 0 0 1.15em;
	}

	:deep(.shared-note__content :is(h1, h2, h3)) {
		text-wrap: balance;
	}

	:deep(.shared-note__content h1) {
		margin: 1.6em 0 0.45em;
		color: var(--ink);
		font-size: 2.5em;
		font-weight: 650;
		letter-spacing: -0.055em;
		line-height: 0.98;
	}

	:deep(.shared-note__content h2) {
		margin: 1.5em 0 0.5em;
		color: var(--accent-strong);
		font-size: 2em;
		font-weight: 620;
		letter-spacing: -0.04em;
		line-height: 1;
	}

	:deep(.shared-note__content h3) {
		margin: 1.4em 0 0.45em;
		color: var(--accent-strong);
		font-size: 1.35em;
		font-weight: 620;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	:deep(.shared-note__content h4),
	:deep(.shared-note__content h5) {
		margin: 1.25em 0 0.4em;
		color: var(--ink-soft);
		font-family: var(--font-sans);
		font-size: 0.82em;
		font-weight: 750;
		letter-spacing: 0.06em;
		line-height: 1.25;
		text-transform: uppercase;
	}

	:deep(.shared-note__content h5) {
		color: var(--ink-faint);
		font-size: 0.68em;
	}

	:deep(.shared-note__content :is(ul, ol)) {
		margin: 0 0 1.2em;
		padding-inline-start: 1.5em;
		list-style-position: outside;
	}

	:deep(.shared-note__content ul) {
		list-style-type: disc;
	}

	:deep(.shared-note__content ol) {
		list-style-type: decimal;
	}

	:deep(.shared-note__content ul ul) {
		list-style-type: circle;
	}

	:deep(.shared-note__content ol ol) {
		list-style-type: lower-alpha;
	}

	:deep(.shared-note__content li) {
		padding-inline-start: 0.25em;
	}

	:deep(.shared-note__content li p) {
		margin-bottom: 0.45em;
	}

	:deep(.shared-note__content li::marker) {
		color: var(--accent-strong);
		font-weight: 650;
	}

	:deep(.shared-note__content blockquote) {
		margin: 1.5em 0;
		border-inline-start: 3px solid var(--accent);
		padding: 0.15em 0 0.15em 1.1em;
		color: var(--ink-soft);
		font-style: italic;
	}

	:deep(.shared-note__content hr) {
		margin: 2.5rem 0;
		border: 0;
		border-top: 1px solid var(--line-strong);
	}

	:deep(.shared-note__content strong) {
		color: var(--ink);
		font-weight: 700;
	}

	.shared-missing {
		display: grid;
		width: min(720px, 100%);
		min-height: 520px;
		align-content: center;
		justify-items: start;
		margin: 5vh auto 0;
		padding: clamp(2rem, 8vw, 6rem);
	}

	.shared-missing > svg {
		margin-bottom: 1.5rem;
		color: var(--ink-faint);
	}

	.shared-missing h1 {
		max-width: 600px;
		font-size: clamp(2.3rem, 7vw, 4.6rem);
	}

	.shared-missing > p:last-child {
		max-width: 500px;
		color: var(--ink-soft);
	}

	@media (max-width: 600px) {
		.shared-page {
			padding: 0.5rem 0.6rem 2rem;
		}

		.shared-page__header {
			min-height: 48px;
			margin-bottom: 0.5rem;
			padding-inline: 0.2rem;
		}

		.shared-page__brand {
			gap: 0.55rem;
		}

		.shared-note__page {
			padding: 1.75rem 1.1rem 3rem;
		}

		.shared-note__rule {
			grid-template-columns: 1fr;
			gap: 0.4rem;
		}

		.shared-note__rule > span:nth-child(2) {
			display: none;
		}
	}
</style>
