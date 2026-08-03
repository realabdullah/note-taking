<script setup lang="ts">
	import { Check, Copy, KeyRound, Plus, Trash2 } from "@lucide/vue";
	import type { CreatedPersonalAccessToken, PersonalAccessToken } from "~~/shared/types/token";

	const tokens = ref<PersonalAccessToken[]>([]);
	const name = ref("");
	const expiresAt = ref("");
	const isCreating = ref(false);
	const isMutating = ref(false);
	const errorMessage = ref("");
	const created = ref<CreatedPersonalAccessToken | null>(null);
	const copied = ref(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	const formatDate = (value: string | null) => {
		if (!value) return "Never";
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			timeZone: "UTC",
		}).format(new Date(value));
	};

	const isExpired = (token: PersonalAccessToken) =>
		token.expiresAt ? Date.parse(token.expiresAt) <= Date.now() : false;

	const loadTokens = async () => {
		try {
			const response = await $fetch<{ tokens: PersonalAccessToken[] }>("/api/tokens");
			tokens.value = response.tokens;
		} catch {
			errorMessage.value = "Could not load your tokens.";
		}
	};

	const createToken = async () => {
		if (!name.value.trim()) return;
		errorMessage.value = "";
		isCreating.value = true;

		try {
			const body: { name: string; expiresAt?: string } = { name: name.value.trim() };
			if (expiresAt.value) body.expiresAt = new Date(expiresAt.value).toISOString();

			created.value = await $fetch<CreatedPersonalAccessToken>("/api/tokens", {
				method: "POST",
				body,
			});
			name.value = "";
			expiresAt.value = "";
			await loadTokens();
		} catch (error) {
			const fetchError = error as { data?: { statusMessage?: string }; statusMessage?: string };
			errorMessage.value =
				fetchError.data?.statusMessage ?? fetchError.statusMessage ?? "Unable to create the token.";
		} finally {
			isCreating.value = false;
		}
	};

	const revoke = async (token: PersonalAccessToken) => {
		const accepted = window.confirm(`Revoke “${token.name}”? Apps using it will lose access immediately.`);
		if (!accepted) return;

		errorMessage.value = "";
		isMutating.value = true;
		try {
			await $fetch(`/api/tokens/${token.id}`, { method: "DELETE" });
			if (created.value?.record.id === token.id) created.value = null;
			await loadTokens();
		} catch (error) {
			const fetchError = error as { data?: { statusMessage?: string }; statusMessage?: string };
			errorMessage.value =
				fetchError.data?.statusMessage ?? fetchError.statusMessage ?? "Unable to revoke the token.";
		} finally {
			isMutating.value = false;
		}
	};

	const copyToken = async () => {
		if (!created.value) return;
		errorMessage.value = "";

		try {
			await navigator.clipboard.writeText(created.value.token);
			copied.value = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied.value = false), 2_000);
		} catch {
			errorMessage.value = "Copy failed. Select the token and copy it manually.";
		}
	};

	onMounted(loadTokens);
	onBeforeUnmount(() => {
		if (copyTimer) clearTimeout(copyTimer);
	});
</script>

<template>
	<div class="pat">
		<form class="pat-form paper" @submit.prevent="createToken">
			<KeyRound :size="22" aria-hidden="true" />
			<div class="field">
				<label class="field__label" for="pat-name">TOKEN NAME</label>
				<input
					id="pat-name"
					v-model="name"
					class="input"
					type="text"
					autocomplete="off"
					maxlength="60"
					placeholder="e.g. Personal OS"
					required
				/>
			</div>
			<div class="field">
				<label class="field__label" for="pat-expiry">EXPIRES (OPTIONAL)</label>
				<input id="pat-expiry" v-model="expiresAt" class="input" type="datetime-local" />
			</div>
			<button class="button button--primary" type="submit" :disabled="isCreating || !name.trim()">
				<Plus :size="17" aria-hidden="true" />
				{{ isCreating ? "Generating…" : "Generate token" }}
			</button>
		</form>

		<p v-if="errorMessage" class="pat-message pat-message--error" role="alert">{{ errorMessage }}</p>

		<div v-if="created" class="pat-created paper">
			<div class="pat-created__head">
				<div>
					<p class="eyebrow">Token created</p>
					<h3>Copy it now — it won’t be shown again.</h3>
				</div>
				<button class="button button--quiet" type="button" @click="copyToken">
					<Check v-if="copied" :size="16" aria-hidden="true" />
					<Copy v-else :size="16" aria-hidden="true" />
					{{ copied ? "Copied" : "Copy" }}
				</button>
			</div>
			<input
				class="input mono pat-created__value"
				:value="created.token"
				readonly
				@focus="($event.target as HTMLInputElement).select()"
			/>
			<p class="pat-created__warn">
				Fieldnote stores only a hash of this token and cannot show it again. Treat it like a password.
			</p>
		</div>

		<div v-if="tokens.length" class="pat-list">
			<div v-for="token in tokens" :key="token.id" class="pat-row">
				<div class="pat-row__identity">
					<strong>{{ token.name }}</strong>
					<span class="mono pat-row__prefix">{{ token.prefix }}…</span>
				</div>
				<div class="pat-row__meta">
					<span class="pat-row__meta-item">
						<span class="mono pat-row__meta-label">CREATED</span>
						<span class="mono">{{ formatDate(token.createdAt) }}</span>
					</span>
					<span class="pat-row__meta-item">
						<span class="mono pat-row__meta-label">LAST USED</span>
						<span class="mono">{{ formatDate(token.lastUsedAt) }}</span>
					</span>
					<span class="pat-row__meta-item">
						<span class="mono pat-row__meta-label">EXPIRES</span>
						<span class="mono" :class="{ 'pat-row__date--expired': isExpired(token) }">
							{{ isExpired(token) ? "Expired" : formatDate(token.expiresAt) }}
						</span>
					</span>
				</div>
				<button
					class="pat-row__revoke"
					type="button"
					:aria-label="`Revoke ${token.name}`"
					:title="`Revoke ${token.name}`"
					:disabled="isMutating"
					@click="revoke(token)"
				>
					<Trash2 :size="16" aria-hidden="true" />
				</button>
			</div>
		</div>

		<p v-else-if="!isCreating" class="pat-empty mono">
			No tokens yet. Generate one to let an external app read your notes.
		</p>
	</div>
</template>

<style scoped>
	.pat {
		display: grid;
		gap: 1.25rem;
		margin-left: 60px;
	}

	.pat-form {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr) auto;
		align-items: end;
		gap: 1rem;
		padding: 1rem;
	}

	.pat-message {
		margin: 0;
		border-left: 3px solid var(--danger);
		padding: 0.6rem 0.75rem;
		background: color-mix(in srgb, var(--danger) 8%, transparent);
		color: var(--danger);
		font-size: 0.78rem;
	}

	.pat-created {
		display: grid;
		gap: 0.85rem;
		padding: 1.25rem;
	}

	.pat-created__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.pat-created h3 {
		margin: 0.3rem 0 0;
		font-size: 1.35rem;
		letter-spacing: -0.02em;
	}

	.pat-created__value {
		letter-spacing: 0.02em;
	}

	.pat-created__warn {
		margin: 0;
		color: var(--danger);
		font-size: 0.82rem;
	}

	.pat-list {
		overflow: hidden;
		border-top: 1px solid var(--line-strong);
	}

	.pat-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 1rem;
		border-bottom: 1px solid var(--line);
		padding: 0.85rem 0.25rem;
	}

	.pat-row__identity {
		display: grid;
		min-width: 0;
		gap: 0.2rem;
	}

	.pat-row__identity strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pat-row__prefix {
		overflow: hidden;
		color: var(--ink-faint);
		font-size: 0.64rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pat-row__meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 1rem 1.25rem;
		color: var(--ink-faint);
	}

	.pat-row__meta-item {
		display: grid;
		gap: 0.15rem;
	}

	.pat-row__meta-label {
		color: var(--ink-faint);
		font-size: 0.55rem;
		letter-spacing: 0.08em;
	}

	.pat-row__meta-item > span:last-child {
		font-size: 0.66rem;
	}

	.pat-row__date--expired {
		color: var(--danger);
	}

	.pat-row__revoke {
		display: grid;
		width: 36px;
		height: 36px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--ink-soft);
		transition:
			background-color var(--motion-fast) var(--ease-out-quick),
			color var(--motion-fast) var(--ease-out-quick),
			transform 80ms var(--ease-out-quick);
	}

	.pat-row__revoke:hover:not(:disabled) {
		background: var(--paper-deep);
		color: var(--danger);
	}

	.pat-row__revoke:active:not(:disabled) {
		transform: scale(0.96);
	}

	.pat-row__revoke:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.pat-empty {
		margin: 0;
		color: var(--ink-faint);
		font-size: 0.7rem;
	}

	@media (max-width: 720px) {
		.pat {
			margin-left: 0;
		}

		.pat-form {
			grid-template-columns: 1fr;
		}

		.pat-created__head {
			flex-direction: column;
		}

		.pat-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.pat-row__meta {
			grid-column: 1 / -1;
			justify-content: flex-start;
		}
	}
</style>
