<script lang="ts" setup>
	interface IconProps {
		name: string;
		width?: number | string;
		height?: number | string;
		fill?: string;
		stroke?: string;
		strokeWidth?: number | string;
		className?: string;
		fallbackIcon?: string;
	}

	const props = defineProps<IconProps>();

	const svgContent = ref<string>("");

	const modifySvg = async () => {
		try {
			const iconModule = await import(`~/assets/icons/${props.name}.svg?raw`).catch(() => null);
			if (!iconModule) throw new Error(`Icon ${props.name} not found`);
			const svgString = iconModule.default;
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = svgString.trim();
			const svgElement = tempDiv.firstChild as SVGSVGElement;

			if (props.width) svgElement.setAttribute("width", String(props.width));
			if (props.height) svgElement.setAttribute("height", String(props.height));

			const paths = svgElement.querySelectorAll("path");
			paths.forEach(path => {
				if (props.fill) {
					const currentFill = path.getAttribute("fill");
					if (currentFill) {
						path.setAttribute("fill", props.fill);
					}
				}

				if (props.stroke) {
					const currentStroke = path.getAttribute("stroke");
					if (currentStroke) {
						path.setAttribute("stroke", props.stroke);
					}
				}

				if (props.strokeWidth) {
					const currentStrokeWidth = path.getAttribute("stroke-width");
					const newStrokeWidth = String(props.strokeWidth);
					if (currentStrokeWidth) {
						path.setAttribute("stroke-width", newStrokeWidth);
					}
				}
			});

			svgContent.value = tempDiv.innerHTML;
		} catch (err) {
			console.warn("IconComponent: Failed to modify SVG", err);
		}
	};

	watch(
		props,
		() => {
			modifySvg();
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="icon inline-block align-middle" :class="className" v-html="svgContent" />
</template>
