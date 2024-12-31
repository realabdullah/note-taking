export const databaseOptions: Array<{ value: APItype; label: string; desc: string }> = [
	{ value: "indexeddb", label: "IndexedDB", desc: "Store data locally on this device. Best for personal use on a single device." },
	{ value: "appwrite", label: "Appwrite", desc: "Cloud storage with Appwrite. Access your notes from any device." },
];

export const colorThemes = [
	{ title: "Light Mode", desc: "Pick a clean and classic light theme", icon: "sun", value: "light" },
	{ title: "Dark Mode", desc: "Select a sleek and modern dark theme", icon: "moon", value: "dark" },
	{ title: "System", desc: "Adapts to your device’s theme", icon: "system-theme", value: "system" },
];

export const fontThemes = [
	{ title: "Sans-serif", desc: "Clean and modern, easy to read.", icon: "font-sans-serif", value: "sans" },
	{ title: "Serif", desc: "Classic and elegant for a timeless feel.", icon: "font-serif", value: "serif" },
	{ title: "Monospace", desc: "Code-like, great for a technical vibe.", icon: "font-monospace", value: "mono" },
];
