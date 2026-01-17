/**
 * @typedef {import("./index.js").Directives} Directives
 */

import json5 from "json5";
import { watch } from "../reactive.js";
import { interpolate, parseFunctionCall } from "../utils.js";

/** @type {Record<string, (a: any, b: any) => boolean>} */
const operators = {
	">": (a, b) => a > b,
	"<": (a, b) => a < b,
	"=": (a, b) => a === b,
	"==": (a, b) => a === b,
	">=": (a, b) => a >= b,
	"<=": (a, b) => a <= b,
	"!=": (a, b) => a !== b,
	"&&": (a, b) => !!(a && b),
	"||": (a, b) => !!(a || b),
};

/** @type {Directives} */
export default {
	if: ({ value, scopedState }) => {
		const [condition, func] = value?.split(/\s*;\s*/) ?? ["false", ""];
		const [a, o, b] = condition.split(/\s+/);

		watch(() => {
			const opA = json5.parse(interpolate(a, scopedState));
			const opB = json5.parse(interpolate(b, scopedState));

			const bool = operators[o](opA, opB) ?? false;

			if (!bool) return;

			const [fnName, fnArgs] = parseFunctionCall(func);
			const fn = scopedState[fnName];
			if (fn) fn.apply(scopedState, fnArgs);
		});
	},
};
