/**
 * @typedef {import("../reactive.js").State} State
 * @typedef {import("../utils.js").ScopedState} ScopedState
 * @typedef {import("../main.js").Plugin} Plugin
 */

/**
 * @typedef {{
 *  value: string,
 *  element: HTMLElement,
 *  scopes: State[],
 *  scopedState: ScopedState,
 *  rootState: State,
 *  directives: Directives,
 *  plugins: Plugin[]
 *  [key: string]: unknown
 * }} DirectiveParams
 * @typedef {(params: DirectiveParams) => void} Directive
 */

/**
 * @typedef {Record<string, Directive>} Directives
 */

export const directives = {};

const directiveModules = import.meta.glob(["./*.js", "!./index.js"], {
	import: "default",
	eager: true,
});

for (const key in directiveModules)
	Object.assign(directives, directiveModules[key]);
