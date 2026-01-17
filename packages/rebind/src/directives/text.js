/**
 * @typedef {import("./index.js").Directives} Directives
 */

import { watch } from "../reactive.js";
import { interpolate } from "../utils.js";

/** @type {Directives} */
export default {
	text: ({ element, value, scopedState }) => {
		watch(() => {
			const result = interpolate(value, scopedState);
			element.textContent = result;
		});
	},
};
