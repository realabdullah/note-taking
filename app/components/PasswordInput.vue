<script setup lang="ts">
	import { Eye, EyeOff } from "@lucide/vue";
	import { computed, onMounted, ref } from "vue";

	defineOptions({ inheritAttrs: false });

	const props = withDefaults(
		defineProps<{
			id: string;
			label?: string;
			tone?: "light" | "dark";
			variant?: "line" | "surface";
		}>(),
		{ label: "password", tone: "light", variant: "line" }
	);

	const model = defineModel<string>({ required: true });
	const visible = ref(false);
	const hydrated = ref(false);
	const toggleLabel = computed(() =>
		visible.value ? `Hide ${props.label ?? "password"}` : `Show ${props.label ?? "password"}`
	);

	onMounted(() => {
		hydrated.value = true;
	});
</script>

<template>
	<span class="relative block">
		<input
			:id="id"
			v-model="model"
			v-bind="$attrs"
			class="min-h-12 w-full border-0 py-3 pr-13 text-base transition-[background-color,box-shadow] duration-150 placeholder:text-current placeholder:opacity-45"
			:class="[
				variant === 'line'
					? 'rounded-none bg-transparent px-0 shadow-[0_1px_0_var(--line-strong)] focus-visible:shadow-[0_2px_0_var(--signal)]'
					: 'rounded-[15px_15px_5px_15px] px-4 shadow-[inset_0_0_0_1px_var(--line)] focus-visible:shadow-[inset_0_0_0_2px_var(--signal),0_0_0_4px_oklch(1_0_0/0.08)]',
				tone === 'dark' ? 'bg-[oklch(0.955_0.025_84/0.09)] text-[oklch(0.955_0.025_84)]' : 'text-ink',
				variant === 'surface' && tone === 'light' ? 'bg-sunken' : '',
			]"
			:type="visible ? 'text' : 'password'"
		/>
		<button
			class="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-current opacity-65 transition-[background-color,opacity,transform] duration-150 hover:bg-current/10 hover:opacity-100 active:scale-96"
			type="button"
			:aria-controls="id"
			:aria-label="toggleLabel"
			:aria-pressed="visible"
			:data-hydrated="hydrated"
			@click="visible = !visible"
		>
			<EyeOff v-if="visible" :size="18" aria-hidden="true" />
			<Eye v-else :size="18" aria-hidden="true" />
		</button>
	</span>
</template>
