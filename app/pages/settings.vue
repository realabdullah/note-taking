<script setup lang="ts">
	import { ArrowLeft, Check, KeyRound, Laptop, Moon, Palette, ShieldCheck, Sun } from "@lucide/vue";
	import { authClient } from "~/lib/auth-client";
	import type { AppearancePreference, ColorTheme } from "~/composables/useTheme";

	definePageMeta({ middleware: "auth" });
	useSeoMeta({ title: "Settings · Fieldnote" });

	const session = authClient.useSession();
	const { preference, colorTheme, setTheme, setColorTheme } = useTheme();
	const currentPassword = ref("");
	const newPassword = ref("");
	const pending = ref(false);
	const message = ref("");
	const errorMessage = ref("");

	const appearances: Array<{
		value: AppearancePreference;
		label: string;
		description: string;
		icon: typeof Sun;
	}> = [
		{ value: "light", label: "Daylight", description: "Bright paper and dark ink", icon: Sun },
		{ value: "dark", label: "Night ink", description: "Low-light writing with soft contrast", icon: Moon },
		{ value: "system", label: "Follow device", description: "Changes with your operating system", icon: Laptop },
	];

	const colorThemes: Array<{
		value: ColorTheme;
		label: string;
		description: string;
		swatches: string[];
	}> = [
		{
			value: "aubergine",
			label: "Aubergine",
			description: "Plum ink, persimmon and citron",
			swatches: ["bg-[oklch(0.265_0.09_307)]", "bg-[oklch(0.67_0.235_39)]", "bg-[oklch(0.86_0.19_118)]"],
		},
		{
			value: "moss",
			label: "Moss",
			description: "Forest ink, marigold and fern",
			swatches: ["bg-[oklch(0.255_0.065_153)]", "bg-[oklch(0.72_0.16_76)]", "bg-[oklch(0.72_0.14_163)]"],
		},
		{
			value: "tide",
			label: "Tide",
			description: "Deep blue, coral and sea glass",
			swatches: ["bg-[oklch(0.235_0.075_248)]", "bg-[oklch(0.68_0.19_31)]", "bg-[oklch(0.78_0.12_191)]"],
		},
		{
			value: "clay",
			label: "Clay",
			description: "Espresso, terracotta and ochre",
			swatches: ["bg-[oklch(0.255_0.07_43)]", "bg-[oklch(0.64_0.18_29)]", "bg-[oklch(0.8_0.13_87)]"],
		},
	];

	const changePassword = async () => {
		message.value = "";
		errorMessage.value = "";
		if (!currentPassword.value) {
			errorMessage.value = "Enter your current password.";
			return;
		}
		if (newPassword.value.length < 8) {
			errorMessage.value = "Choose a new password with at least 8 characters.";
			return;
		}

		pending.value = true;
		const { error } = await authClient.changePassword({
			currentPassword: currentPassword.value,
			newPassword: newPassword.value,
			revokeOtherSessions: true,
		});
		pending.value = false;

		if (error) {
			errorMessage.value =
				error.message ?? "Unable to change your password. Check the current password and try again.";
			return;
		}

		currentPassword.value = "";
		newPassword.value = "";
		message.value = "Password changed. Other sessions were signed out.";
	};
</script>

<template>
	<div class="min-h-dvh px-4 pb-24 pt-28 text-ink sm:px-7 lg:px-10">
		<div class="mx-auto w-full max-w-[1180px]">
			<header class="mb-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
				<div>
					<NuxtLink
						to="/"
						class="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[oklch(0.22_0.07_303)] px-4 text-xs font-bold text-[oklch(0.97_0.02_84)] transition-[background-color,transform] duration-150 hover:bg-[oklch(0.3_0.09_303)] active:scale-96"
					>
						<ArrowLeft :size="16" aria-hidden="true" /> Return to your desk
					</NuxtLink>
					<p class="mb-2 text-xs font-bold text-signal">Make Fieldnote yours</p>
					<h1
						class="max-w-[11ch] text-balance font-serif text-[clamp(3.4rem,8vw,7rem)] font-[590] leading-[0.88] tracking-[-0.06em]"
					>
						Settings without the control panel feeling.
					</h1>
				</div>
				<p class="max-w-[34ch] text-pretty text-sm leading-6 text-ink-soft">
					Choose how the notebook looks, protect your account, and manage outside access. Changes apply
					immediately.
				</p>
			</header>

			<div class="grid gap-12">
				<section aria-labelledby="color-heading" class="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
					<header>
						<div
							class="mb-4 grid size-11 place-items-center rounded-[16px_16px_5px_16px] bg-signal text-plum"
						>
							<Palette :size="20" aria-hidden="true" />
						</div>
						<h2 id="color-heading" class="font-serif text-3xl font-semibold tracking-[-0.035em]">
							Color character
						</h2>
						<p class="mt-2 text-sm leading-6 text-ink-soft">
							A palette changes the whole notebook, not just one accent.
						</p>
					</header>
					<div class="grid gap-3 sm:grid-cols-2">
						<button
							v-for="theme in colorThemes"
							:key="theme.value"
							type="button"
							:aria-pressed="colorTheme === theme.value"
							class="group relative min-h-40 overflow-hidden rounded-[28px_28px_8px_28px] bg-raised p-5 text-left shadow-[0_14px_40px_oklch(0.18_0.05_303/0.1)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_22px_50px_oklch(0.18_0.05_303/0.16)] active:scale-96"
							@click="setColorTheme(theme.value)"
						>
							<span class="mb-8 flex -space-x-2" aria-hidden="true">
								<i
									v-for="swatch in theme.swatches"
									:key="swatch"
									class="size-9 rounded-full ring-2 ring-raised"
									:class="swatch"
								/>
							</span>
							<strong class="block font-serif text-2xl font-semibold tracking-[-0.03em]">{{
								theme.label
							}}</strong>
							<small class="mt-1 block text-xs leading-5 text-ink-soft">{{ theme.description }}</small>
							<span
								v-if="colorTheme === theme.value"
								class="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-ink text-canvas"
							>
								<Check :size="15" aria-hidden="true" />
							</span>
						</button>
					</div>
				</section>

				<section aria-labelledby="appearance-heading" class="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
					<header>
						<h2 id="appearance-heading" class="font-serif text-3xl font-semibold tracking-[-0.035em]">
							Appearance
						</h2>
						<p class="mt-2 text-sm leading-6 text-ink-soft">
							Set the light level independently from your palette.
						</p>
					</header>
					<div class="grid gap-3 md:grid-cols-3">
						<button
							v-for="appearance in appearances"
							:key="appearance.value"
							type="button"
							:aria-pressed="preference === appearance.value"
							class="relative flex min-h-32 flex-col justify-between rounded-[24px_24px_7px_24px] bg-surface p-4 text-left shadow-[inset_0_1px_0_oklch(1_0_0/0.45)] transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-raised active:scale-96"
							@click="setTheme(appearance.value)"
						>
							<component :is="appearance.icon" :size="20" aria-hidden="true" />
							<span
								v-if="preference === appearance.value"
								class="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-ink text-canvas"
							>
								<Check :size="15" aria-hidden="true" />
							</span>
							<span
								><strong class="block text-sm font-bold">{{ appearance.label }}</strong
								><small class="mt-1 block text-xs leading-5 text-ink-soft">{{
									appearance.description
								}}</small></span
							>
						</button>
					</div>
				</section>

				<section aria-labelledby="security-heading" class="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
					<header>
						<div
							class="mb-4 grid size-11 place-items-center rounded-[16px_16px_5px_16px] bg-thread text-plum"
						>
							<ShieldCheck :size="20" aria-hidden="true" />
						</div>
						<h2 id="security-heading" class="font-serif text-3xl font-semibold tracking-[-0.035em]">
							Account security
						</h2>
						<p class="mt-2 break-words text-sm leading-6 text-ink-soft">
							Signed in as {{ session.data?.user.email }}
						</p>
					</header>
					<form
						class="rounded-[32px_32px_9px_32px] bg-plum p-5 text-raised shadow-[0_20px_60px_oklch(0.18_0.05_303/0.18)] sm:p-7"
						@submit.prevent="changePassword"
					>
						<div class="mb-7 flex items-center gap-3">
							<KeyRound :size="20" aria-hidden="true" />
							<p class="text-sm font-bold">Change your password</p>
						</div>
						<div class="grid gap-5 md:grid-cols-2">
							<div class="grid gap-2">
								<label class="text-xs font-bold text-[oklch(0.82_0.03_84)]" for="current-password"
									>Current password</label
								><PasswordInput
									id="current-password"
									v-model="currentPassword"
									tone="dark"
									variant="surface"
									label="current password"
									autocomplete="current-password"
									required
								/>
							</div>
							<div class="grid gap-2">
								<label class="text-xs font-bold text-[oklch(0.82_0.03_84)]" for="new-password"
									>New password</label
								><PasswordInput
									id="new-password"
									v-model="newPassword"
									tone="dark"
									variant="surface"
									label="new password"
									autocomplete="new-password"
									minlength="8"
									maxlength="128"
									required
									placeholder="At least 8 characters"
								/>
							</div>
						</div>
						<p class="mt-3 text-xs leading-5 text-[oklch(0.78_0.03_84)]">
							Changing your password signs out your other sessions.
						</p>
						<p
							v-if="errorMessage"
							class="mt-4 rounded-xl bg-[oklch(0.45_0.13_27/0.25)] px-3 py-2 text-sm text-[oklch(0.9_0.08_27)]"
							role="alert"
						>
							{{ errorMessage }}
						</p>
						<p
							v-if="message"
							class="mt-4 rounded-xl bg-[oklch(0.5_0.1_155/0.2)] px-3 py-2 text-sm text-[oklch(0.9_0.07_155)]"
							role="status"
						>
							{{ message }}
						</p>
						<button
							class="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-signal px-5 text-sm font-bold text-plum transition-transform duration-150 active:scale-96 disabled:cursor-wait disabled:opacity-60"
							type="submit"
							:disabled="pending"
						>
							{{ pending ? "Changing password…" : "Change password" }}
						</button>
					</form>
				</section>

				<section aria-labelledby="tokens-heading" class="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
					<header>
						<h2 id="tokens-heading" class="font-serif text-3xl font-semibold tracking-[-0.035em]">
							Outside access
						</h2>
						<p class="mt-2 text-sm leading-6 text-ink-soft">
							Create personal tokens for apps that need to read your notes.
						</p>
					</header>
					<PersonalAccessTokens />
				</section>

				<section aria-labelledby="install-heading" class="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
					<header>
						<h2 id="install-heading" class="font-serif text-3xl font-semibold tracking-[-0.035em]">
							Keep it close
						</h2>
						<p class="mt-2 text-sm leading-6 text-ink-soft">
							Install Fieldnote for a focused, full-screen notebook.
						</p>
					</header>
					<div class="rounded-[24px_24px_7px_24px] bg-surface p-4"><InstallButton /></div>
				</section>
			</div>
		</div>
	</div>
</template>
