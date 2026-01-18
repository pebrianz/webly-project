import { watch } from "../reactive.js";
import { interpolate } from "../utils.js";

/**
 * @internal
 * @type {import("../types.d.ts").Directives}
 */
export default {
	text: ({ element, value, scopedState }) => {
		watch(() => {
			const result = interpolate(value, scopedState);
			element.textContent = result;
		});
	},
};
