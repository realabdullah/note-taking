<script setup lang="ts">
	defineProps<{ eyebrow: string; title: string; description: string }>();
</script>

<template>
	<section class="auth-panel">
		<header>
			<p>{{ eyebrow }}</p>
			<h1>{{ title }}</h1>
			<span>{{ description }}</span>
		</header>
		<slot />
	</section>
</template>

<style scoped>
	.auth-panel {
		width: 100%;
		border-radius: 44px 44px 10px 44px;
		padding: clamp(1.5rem, 5vw, 3.25rem);
		background: oklch(0.965 0.03 83);
		color: var(--plum);
		box-shadow: 0 36px 90px oklch(0.1 0.035 303 / 0.32);
		rotate: -0.8deg;
	}
	.auth-panel header {
		margin-bottom: 2rem;
	}
	.auth-panel header p {
		margin: 0 0 0.6rem;
		color: var(--signal-strong);
		font-size: 0.68rem;
		font-weight: 750;
	}
	.auth-panel h1 {
		max-width: 11ch;
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3rem, 8vw, 5.7rem);
		font-weight: 630;
		letter-spacing: -0.065em;
		line-height: 0.84;
		text-wrap: balance;
	}
	.auth-panel header > span {
		display: block;
		max-width: 44ch;
		margin-top: 1.1rem;
		color: color-mix(in oklch, var(--plum) 68%, transparent);
		font-size: 0.78rem;
		line-height: 1.55;
		text-wrap: pretty;
	}
	:deep(.auth-form) {
		display: grid;
		gap: 1rem;
	}
	:deep(.field) {
		gap: 0.25rem;
	}
	:deep(.field__label) {
		color: color-mix(in oklch, var(--plum) 62%, transparent);
		font-size: 0.62rem;
		font-weight: 750;
		letter-spacing: 0.08em;
	}
	:deep(.input) {
		min-height: 50px;
		border: 0;
		border-block-end: 1.5px solid color-mix(in oklch, var(--plum) 25%, transparent);
		border-radius: 0;
		padding: 0.65rem 0.1rem;
		background: transparent;
		color: var(--plum);
		font-family: var(--font-serif);
		font-size: 1.15rem;
		box-shadow: none;
	}
	:deep(.input:focus) {
		border-color: var(--signal);
		box-shadow: none;
		outline: 0;
	}
	:deep(.input:focus-visible) {
		outline: 0;
		box-shadow: 0 2px 0 var(--signal);
	}
	:deep(.input::placeholder) {
		color: color-mix(in oklch, var(--plum) 40%, transparent);
	}
	:deep(.auth-form > .button--primary) {
		min-height: 54px;
		margin-top: 0.4rem;
		border: 0;
		border-radius: 999px;
		background: var(--plum);
		color: oklch(0.965 0.03 83);
	}
	:deep(.auth-form > .button--primary:hover) {
		background: var(--signal-strong);
		color: var(--plum);
	}
	:deep(.button--quiet) {
		border-color: color-mix(in oklch, var(--plum) 22%, transparent);
		background: transparent;
	}
	:deep(.auth-form__error),
	:deep(.auth-form__success) {
		margin: 0;
		border-radius: 12px;
		padding: 0.7rem 0.8rem;
		background: color-mix(in oklch, var(--danger) 10%, transparent);
		color: var(--danger);
		font-size: 0.75rem;
	}
	:deep(.auth-form__success) {
		background: color-mix(in oklch, var(--success) 12%, transparent);
		color: var(--success);
	}
	:deep(.auth-form__switch) {
		margin: 0.4rem 0 0;
		color: color-mix(in oklch, var(--plum) 65%, transparent);
		font-size: 0.76rem;
		text-align: center;
	}
	:deep(.auth-form__switch a),
	:deep(.login-row a) {
		color: var(--signal-strong);
		font-weight: 750;
		text-underline-position: from-font;
	}
	:deep(.auth-divider) {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
		color: color-mix(in oklch, var(--plum) 45%, transparent);
		font-size: 0.62rem;
	}
	:deep(.auth-divider::before),
	:deep(.auth-divider::after) {
		height: 1px;
		background: color-mix(in oklch, var(--plum) 16%, transparent);
		content: "";
	}
	@media (max-width: 650px) {
		.auth-panel {
			border-radius: 32px 32px 8px 32px;
			rotate: 0deg;
		}
		.auth-panel h1 {
			font-size: clamp(3.2rem, 14vw, 5rem);
		}
	}
</style>
