// @ts-check
import { defineConfig } from "vite";

export const baseConfig = defineConfig({
	build: {
		lib: {
			entry: ["./src/index.js"],
			formats: ["es", "cjs"],
		},
		minify: "terser",
	},
});
