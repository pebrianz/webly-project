// @ts-check
import { defineConfig, mergeConfig } from "vite";
import { baseConfig } from "./vite.config.base";

export default mergeConfig(
	baseConfig,
	defineConfig({
		build: {
			outDir: "./dist/bundle",
			terserOptions: {
				module: true,
				compress: { defaults: false, unused: true },
				mangle: false,
			},
			sourcemap: "inline",
		},
	}),
);
