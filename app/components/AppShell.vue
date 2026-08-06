<script setup lang="ts">
	import { Check, LogOut, Menu, Moon, Settings, Sun, X } from "@lucide/vue";
	import { authClient } from "~/lib/auth-client";
	import { clearLocalUserData } from "~/lib/local-db.client";

	const session = authClient.useSession();
	const route = useRoute();
	const { preference, setTheme } = useTheme();
	const isDarkTheme = computed(() => preference.value === "dark");
	const toggleTheme = () => setTheme(isDarkTheme.value ? "light" : "dark");
	const menuOpen = ref(false);
	const menuButton = ref<HTMLButtonElement | null>(null);
	const currentSpace = computed(() => (typeof route.query.space === "string" ? route.query.space : "write"));
	const noteIsOpen = computed(() => typeof route.query.note === "string");

	const goHome = async (query: Record<string, string> = {}) => {
		menuOpen.value = false;
		await navigateTo({ path: "/", query });
	};

	const signOut = async () => {
		const userId = session.value.data?.user.id;
		if (userId) await clearLocalUserData(userId);
		await authClient.signOut();
		await navigateTo("/login");
	};

	const closeMenu = () => {
		menuOpen.value = false;
		nextTick(() => menuButton.value?.focus());
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape" && menuOpen.value) closeMenu();
		if (!(event.metaKey || event.ctrlKey)) return;
		if (event.key.toLowerCase() === "k") {
			event.preventDefault();
			void goHome({ space: "search" });
		}
	};

	onMounted(() => window.addEventListener("keydown", handleKeydown));
	onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
	<div class="world-shell">
		<a class="skip-link" href="#main-content">Skip to writing space</a>
		<header class="world-chrome" :class="{ 'world-chrome--editor': noteIsOpen }">
			<button class="wordmark" type="button" aria-label="Return to the writing desk" @click="goHome()">
				<FieldnoteLogo />
			</button>

			<div v-if="!noteIsOpen" class="world-chrome__end">
				<SyncIndicator compact />
				<button
					ref="menuButton"
					class="portal-button"
					type="button"
					:aria-expanded="menuOpen"
					aria-controls="fieldnote-portal"
					:aria-label="menuOpen ? 'Close Fieldnote menu' : 'Open Fieldnote menu'"
					@click="menuOpen = !menuOpen"
				>
					<X v-if="menuOpen" :size="20" aria-hidden="true" />
					<Menu v-else :size="20" aria-hidden="true" />
				</button>
			</div>
		</header>

		<main id="main-content" class="world-main"><slot /></main>

		<Transition name="portal-scrim">
			<div v-if="menuOpen" class="portal-scrim" aria-hidden="true" @click="closeMenu" />
		</Transition>
		<Transition name="portal-panel">
			<section v-if="menuOpen" id="fieldnote-portal" class="portal" aria-label="Fieldnote menu">
				<p class="portal__hello">{{ session.data?.user.name || "Your fieldnote" }}</p>
				<nav aria-label="Workspace destinations">
					<button
						type="button"
						:aria-current="currentSpace === 'write' ? 'page' : undefined"
						@click="goHome()"
					>
						<span>01</span>Write<Check v-if="currentSpace === 'write'" :size="18" aria-hidden="true" />
					</button>
					<button
						type="button"
						:aria-current="currentSpace === 'library' ? 'page' : undefined"
						@click="goHome({ space: 'library' })"
					>
						<span>02</span>Browse<Check v-if="currentSpace === 'library'" :size="18" aria-hidden="true" />
					</button>
					<button
						type="button"
						:aria-current="currentSpace === 'search' ? 'page' : undefined"
						@click="goHome({ space: 'search' })"
					>
						<span>03</span>Find<Check v-if="currentSpace === 'search'" :size="18" aria-hidden="true" />
					</button>
					<button
						type="button"
						:aria-current="currentSpace === 'archive' ? 'page' : undefined"
						@click="goHome({ space: 'archive' })"
					>
						<span>04</span>Archive<Check v-if="currentSpace === 'archive'" :size="18" aria-hidden="true" />
					</button>
				</nav>
				<div class="portal__utilities">
					<button type="button" @click="toggleTheme">
						<Sun v-if="isDarkTheme" :size="17" aria-hidden="true" />
						<Moon v-else :size="17" aria-hidden="true" />
						{{ isDarkTheme ? "Use daylight" : "Use night ink" }}
					</button>
					<NuxtLink to="/settings" @click="menuOpen = false"
						><Settings :size="17" aria-hidden="true" />Settings</NuxtLink
					>
					<button type="button" @click="signOut"><LogOut :size="17" aria-hidden="true" />Sign out</button>
				</div>
				<p class="portal__route">{{ route.path === "/" ? "One desk, every thought." : "Fieldnote" }}</p>
			</section>
		</Transition>

		<InstallPromptBanner />
	</div>
</template>

<style scoped>
	.world-shell {
		min-height: 100dvh;
	}
	.skip-link {
		position: fixed;
		z-index: 100;
		inset-block-start: 0.75rem;
		inset-inline-start: 0.75rem;
		translate: 0 -200%;
		padding: 0.75rem 1rem;
		border-radius: 999px;
		background: var(--ink);
		color: var(--canvas);
	}
	.skip-link:focus {
		translate: 0;
	}
	.world-chrome {
		position: fixed;
		z-index: 40;
		inset: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: max(1rem, env(safe-area-inset-top)) clamp(1rem, 3vw, 2rem);
		background: color-mix(in oklch, var(--canvas) 74%, transparent);
		backdrop-filter: blur(18px) saturate(1.05);
		-webkit-backdrop-filter: blur(18px) saturate(1.05);
		pointer-events: none;
	}
	.wordmark,
	.world-chrome__end {
		pointer-events: auto;
	}
	.world-chrome--editor {
		width: max-content;
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	.wordmark {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.7rem;
		border: 0;
		padding: 0;
		background: transparent;
		color: var(--ink);
		font-family: var(--font-serif);
		font-size: 1.15rem;
		font-weight: 720;
		letter-spacing: -0.035em;
	}
	.world-chrome__end {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	.portal-button {
		display: grid;
		width: 46px;
		height: 46px;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
		color: var(--canvas);
		box-shadow: var(--shadow-float);
		transition:
			scale 130ms var(--ease-out-quick),
			rotate 180ms var(--ease-out-quick);
	}
	.portal-button:active {
		scale: 0.96;
	}
	.portal-button[aria-expanded="true"] {
		rotate: 6deg;
	}
	.world-main {
		min-height: 100dvh;
	}
	.portal-scrim {
		position: fixed;
		z-index: 45;
		inset: 0;
		background: oklch(0.12 0.04 303 / 0.52);
	}
	.portal {
		position: fixed;
		z-index: 50;
		inset-block-start: 4.8rem;
		inset-inline-end: clamp(1rem, 3vw, 2rem);
		width: min(390px, calc(100vw - 2rem));
		border-radius: 32px 8px 32px 32px;
		padding: 1.5rem;
		background: var(--thread);
		color: var(--plum);
		box-shadow: 0 24px 90px oklch(0.12 0.04 303 / 0.35);
		transform-origin: 100% 0;
	}
	.portal__hello {
		margin: 0 0 1.6rem;
		font-family: var(--font-serif);
		font-size: 1.55rem;
		font-weight: 680;
	}
	.portal nav {
		display: grid;
	}
	.portal nav button {
		display: grid;
		min-height: 58px;
		grid-template-columns: 2.5rem 1fr auto;
		align-items: center;
		border: 0;
		border-block-start: 1px solid oklch(0.2 0.055 303 / 0.2);
		padding: 0;
		background: transparent;
		color: inherit;
		font-family: var(--font-serif);
		font-size: 2rem;
		text-align: start;
		transition: padding-inline-start 150ms var(--ease-out-quick);
	}
	.portal nav button:hover {
		padding-inline-start: 0.55rem;
	}
	.portal nav button[aria-current="page"] {
		font-weight: 680;
	}
	.portal nav button:active {
		scale: 0.98;
	}
	.portal nav span {
		font-family: var(--font-sans);
		font-size: 0.66rem;
		font-weight: 700;
	}
	.portal__utilities {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 1.4rem;
	}
	.portal__utilities button,
	.portal__utilities a {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		gap: 0.4rem;
		border: 0;
		border-radius: 999px;
		padding: 0.55rem 0.75rem;
		background: oklch(0.2 0.055 303 / 0.1);
		color: inherit;
		font-size: 0.72rem;
		font-weight: 650;
	}
	.portal__utilities button:active,
	.portal__utilities a:active {
		scale: 0.96;
	}
	.portal__route {
		margin: 1.4rem 0 0;
		font-size: 0.7rem;
		opacity: 0.65;
	}
	.portal-scrim-enter-active,
	.portal-scrim-leave-active {
		transition: opacity 130ms ease-out;
	}
	.portal-scrim-enter-from,
	.portal-scrim-leave-to {
		opacity: 0;
	}
	.portal-panel-enter-active,
	.portal-panel-leave-active {
		transition:
			opacity 150ms var(--ease-out-quick),
			transform 150ms var(--ease-out-quick);
	}
	.portal-panel-enter-from,
	.portal-panel-leave-to {
		opacity: 0;
		transform: scale(0.96) translate(5px, -4px);
	}
	@media (max-width: 540px) {
		.wordmark :deep(.fieldnote-logo__name) {
			display: none;
		}
		.world-chrome :deep(.sync-indicator) {
			display: none;
		}
		.portal {
			inset-block-start: 4.4rem;
		}
	}
	@media (prefers-reduced-transparency: reduce) {
		.world-chrome {
			background: var(--canvas);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wordmark__orbit,
		.portal-button,
		.portal {
			transition: opacity 120ms ease-out;
			transform: none;
			rotate: 0;
		}
	}
</style>
