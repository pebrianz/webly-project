// @ts-check
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

export default defineConfig([
	{
		input: "./src/index.js",
		output: [
			{
				dir: "dist/es/types",
				format: "es",
				preserveModules: true,
				preserveModulesRoot: "src",
			},
		],
		plugins: [dts()],
	},
	{
		input: "./src/index.js",
		output: [
			{
				dir: "dist/bundle/types",
				format: "es",
				preserveModulesRoot: "src",
			},
		],
		plugins: [dts()],
	},
]);
