<script setup lang="ts">
	useTheme();
</script>

<template>
	<main class="auth-world">
		<NuxtLink class="auth-wordmark" to="/" aria-label="Fieldnote home"><FieldnoteLogo inverted /></NuxtLink>
		<div class="auth-world__type" aria-hidden="true">
			<span>loose</span><span>brilliant</span><span>unfinished</span>
		</div>
		<div class="auth-world__scribble" aria-hidden="true" />
		<section class="auth-world__form"><slot /></section>
		<p class="auth-world__promise">Private by default · local-first · yours everywhere</p>
	</main>
</template>

<style scoped>
	.auth-world {
		position: relative;
		display: grid;
		min-height: 100dvh;
		overflow: hidden;
		place-items: center;
		padding: 7rem 1.25rem 5rem;
		background: var(--plum);
		color: oklch(0.955 0.025 84);
		isolation: isolate;
	}
	.auth-world::before {
		position: absolute;
		z-index: -2;
		width: min(54vw, 640px);
		height: min(54vw, 640px);
		inset: 50% auto auto 50%;
		border-radius: 50%;
		background: var(--signal);
		content: "";
		translate: -50% -48%;
	}
	.auth-world::after {
		position: absolute;
		z-index: -1;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
		content: "";
		opacity: 0.11;
		mix-blend-mode: multiply;
	}
	.auth-wordmark {
		position: absolute;
		inset: max(1.25rem, env(safe-area-inset-top)) auto auto clamp(1.25rem, 3vw, 2.2rem);
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.65rem;
		font-family: var(--font-serif);
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.035em;
	}
	.auth-world__type {
		position: absolute;
		z-index: -1;
		inset: 7% -1rem auto;
		display: flex;
		justify-content: space-between;
		color: oklch(0.955 0.025 84 / 0.13);
		font-family: var(--font-serif);
		font-size: clamp(5rem, 15vw, 16rem);
		font-weight: 700;
		letter-spacing: -0.08em;
		line-height: 0.75;
		white-space: nowrap;
		rotate: -5deg;
	}
	.auth-world__type span:nth-child(2),
	.auth-world__type span:nth-child(3) {
		position: absolute;
		inset: 1em auto auto 30%;
	}
	.auth-world__type span:nth-child(3) {
		inset: 2em -8vw auto auto;
	}
	.auth-world__form {
		width: min(580px, 100%);
	}
	.auth-world__scribble {
		position: absolute;
		z-index: -1;
		width: 160px;
		height: 160px;
		inset: auto 4vw 5vh auto;
		border: 3px solid var(--thread);
		border-color: var(--thread) transparent var(--thread) var(--thread);
		border-radius: 48% 52% 40% 60%;
		rotate: 18deg;
		opacity: 0.8;
	}
	.auth-world__promise {
		position: absolute;
		inset: auto auto max(1.2rem, env(safe-area-inset-bottom)) 50%;
		margin: 0;
		color: oklch(0.94 0.025 84 / 0.68);
		font-size: 0.67rem;
		font-weight: 650;
		translate: -50% 0;
		white-space: nowrap;
	}
	@media (max-width: 650px) {
		.auth-world {
			place-items: start center;
			padding-top: 7rem;
		}
		.auth-world::before {
			width: 108vw;
			height: 108vw;
			inset-block-start: 46%;
		}
		.auth-world__type {
			inset-block-start: 18%;
		}
		.auth-world__promise {
			width: calc(100% - 2rem);
			text-align: center;
			white-space: normal;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.auth-world__type {
			animation: auth-drift 18s ease-in-out infinite alternate;
		}
		@keyframes auth-drift {
			to {
				translate: -3vw 2vh;
				rotate: -3deg;
			}
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.auth-world__type {
			animation: none;
		}
	}
</style>
