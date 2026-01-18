import { dts } from "rollup-plugin-dts";

const config = [
  {
    input: "./src/index.js",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
