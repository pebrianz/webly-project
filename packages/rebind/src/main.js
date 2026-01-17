/**
 * @typedef {import("./reactive.js").State} State
 * @typedef {import("./utils.js").ScopedState} ScopedState
 * @typedef {import("./directives/index.js").Directives} Directives
 * @typedef {import("./directives/index.js").Directive} Directive
 */

/**
 * @template element extends Node
 * @typedef {element & { scopes?: State[]} } NodeWithScopes
 */

import json5 from "json5";
import { directives } from "./directives/index.js";
import { observe, watch } from "./reactive.js";
import { createScopedState, interpolate, parseFunctionCall } from "./utils.js";

/**
 * @typedef {Record<string, unknown>} DirectiveExtraArgs
 * @typedef {{
 *  element: HTMLElement,
 *  scopes: State[],
 *  scopedState: ScopedState,
 *  rootState: State,
 *  directives: Directives,
 *  directiveExtraArgs: DirectiveExtraArgs
 * }} PluginParams
 * @typedef {(params: PluginParams) => DirectiveExtraArgs} Plugin
 */

export class Rebind {
	/** @type {State} */
	#state = {};

	/** @type {Directives} */
	#directives = {};

	/** @type {Plugin[]} */
	#plugins = [];

	/** @param {Node | string} selectors */
	constructor(selectors) {
		this.root =
			selectors instanceof Node ? selectors : document.querySelector(selectors);
	}

	/** @param {State[]} state */
	state(...state) {
		this.#state = createScopedState(state);
		return this;
	}

	/** @param {Directives} directives */
	directives(directives) {
		this.#directives = directives;
		return this;
	}

	/** @param {Plugin[]} plugins */
	plugins(plugins) {
		this.#plugins = plugins;
		return this;
	}

	/** @returns {Promise<void>} */
	run() {
		const walker = document.createTreeWalker(this.root, Node.ELEMENT_NODE);

		while (walker.nextNode()) {
			const currentNode = /** @type {NodeWithScopes<HTMLElement>} */ (
				walker.currentNode
			);
			const parentNode = /** @type {NodeWithScopes<HTMLElement>} */ (
				currentNode.parentNode
			);

			if (!currentNode.scopes) currentNode.scopes = [];
			currentNode.scopes.unshift(...(parentNode.scopes ?? []));

			currentNode.scopes.push({
				$element: currentNode,
				$select: (selectors) => currentNode.querySelector(selectors),
				$selectAll: (selectors) => currentNode.querySelectorAll(selectors),
			});

			const data = currentNode.getAttribute("@data") ?? "{}";
			currentNode.scopes.push(observe(json5.parse(data)));

			const scopedState = createScopedState([
				this.#state,
				...currentNode.scopes,
			]);

			const init = currentNode.getAttribute("@init");
			if (init) {
				const [fnName, fnArg] = parseFunctionCall(init ?? "") || [];
				const fn = /** @type {Function} */ (scopedState[fnName]);
				if (fn) fn.apply(scopedState, fnArg);
			}

			const directiveExtraArgs = /** @type {DirectiveExtraArgs} */({});

			for (const plugin of this.#plugins) {
				/** @type {DirectiveExtraArgs} */
				const newDirectiveExtraArts = plugin({
					element: currentNode,
					rootState: this.#state,
					scopes: currentNode.scopes ?? [],
					scopedState,
					directives: this.#directives,
					directiveExtraArgs,
				});
				Object.assign(directiveExtraArgs, newDirectiveExtraArts);
			}

			for (const attribute of currentNode.attributes) {
				const { name, value } = attribute;
				if (!name.startsWith("@")) continue;

				if (name.startsWith("@:")) {
					watch(() => {
						currentNode.setAttribute(
							name.slice(2),
							interpolate(value, scopedState),
						);
					});
				}

				const directive = /** @type {Directive} */ (
					{ ...directives, ...this.#directives }[name.slice(1)]
				);
				if (!directive) continue;

				directive({
					value,
					element: currentNode,
					scopedState,
					directives: this.#directives,
					scopes: currentNode.scopes,
					rootState: this.#state,
					plugins: this.#plugins,
					...directiveExtraArgs,
				});
			}
		}

		return Promise.resolve();
	}
}
