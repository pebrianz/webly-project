import { defineConfig } from "vite";

export default defineConfig({
	build: {
		rollupOptions: {
		},
		lib: {
			entry: "./src/index.js",
			fileName: "index",
			name: "index",
		},
		minify: "terser",
	},
});
