import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
	ignores: [".nuxt/**", ".output/**", "coverage/**", "playwright-report/**", "test-results/**"],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		"vue/html-self-closing": "off",
		"vue/multi-word-component-names": "off",
	},
});
