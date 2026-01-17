import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		root: import.meta.dirname,
		projects: [
			{
				extends: true,
				test: {
					include: ["**/tests/**/*.browser.test.js"],
					name: "happy-dom",
					environment: "happy-dom",
				},
			},
			{
				extends: true,
				test: {
					include: ["**/tests/**/*.node.test.js"],
					name: { label: "node", color: "green" },
					environment: "node",
				},
			},
		],
	},
});
