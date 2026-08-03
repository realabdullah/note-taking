import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const resolveH3 = () => {
	const h3 = readdirSync(new URL("./node_modules/.pnpm/", import.meta.url)).find(name => name.startsWith("h3@1."));
	if (!h3) throw new Error("Unable to locate the h3 package for tests");
	return fileURLToPath(new URL(`./node_modules/.pnpm/${h3}/node_modules/h3`, import.meta.url));
};

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			h3: resolveH3(),
		},
	},
	test: {
		environment: "happy-dom",
		include: ["tests/unit/**/*.test.ts"],
		coverage: {
			reporter: ["text", "html"],
		},
	},
});
