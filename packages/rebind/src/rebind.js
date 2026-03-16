import { directives } from "./directives.js";
import { observe, watch } from "./reactive.js";
import { interp, isJSON, parseFnCall, scopedState } from "./utils.js";

export class Rebind {
	/**
	 * @internal
	 * @type {Node}
	 */
	#root;

	/**
	 * @internal
	 * @type {import("./types.d.ts").Config}
	 */
	#config = {
		jsonParse: JSON.parse,
		jsonRevier: (_, value) => value,
		clean: {
			scopes: true,
			directives: true,
		},
	};

	/**
	 * @internal
	 * @type {import("./types.d.ts").State}
	 */
	#state = {};

	/**
	 * @internal
	 * @type {import("./types.d.ts").Directives}
	 */
	#directives = {};

	/**
	 * @internal
	 * @type {import("./types.d.ts").Plugin[]}
	 */
	#plugins = [];

	/** @param {Node | string} selectors */
	constructor(selectors) {
		this.#root =
			selectors instanceof Node ? selectors : document.querySelector(selectors);
	}

	/** @param {import("./types.d.ts").Config} config */
	config(config) {
		this.#config = Object.assign(this.#config, config);
		return this;
	}

	/** @param {import("./types.d.ts").State[]} state */
	state(...state) {
		this.#state = scopedState(state);
		return this;
	}

	/** @param {import("./types.d.ts").Directives} directives */
	directives(directives) {
		this.#directives = directives;
		return this;
	}

	/** @param {import("./types.d.ts").Plugin[]} plugins */
	plugins(plugins) {
		this.#plugins = plugins;
		return this;
	}

	run() {
		const _root = this.#root;
		const _config = this.#config;
		const _directives = this.#directives;
		const _plugins = this.#plugins;
		const _state = this.#state;
		const walker = document.createTreeWalker(_root, Node.ELEMENT_NODE);

		let nextNode = walker.nextNode();

		while (nextNode) {
			const currentNode =
				/** @type {import("./types.d.ts").NodeWithScopes<HTMLElement>} */ (
					nextNode
				);
			const parentNode =
				/** @type {import("./types.d.ts").NodeWithScopes<HTMLElement>} */ (
					currentNode.parentNode
				);

			if (currentNode.hasAttribute("@skip")) {
				if (this.#config.clean.directives) currentNode.removeAttribute("@skip");
				nextNode = walker.nextSibling();
				continue;
			}

			if (!currentNode.scopes) currentNode.scopes = [];
			currentNode.scopes.unshift(...(parentNode.scopes ?? []));

			currentNode.scopes.push({
				$element: currentNode,
				$select: (selectors) => currentNode.querySelector(selectors),
				$selectAll: (selectors) => currentNode.querySelectorAll(selectors),
			});

			const json = currentNode.getAttribute("@data") ?? "{}";
			let data;
			if (isJSON(json)) {
				data = _config.jsonParse(json, _config.jsonRevier);
			} else {
				data = scopedState([_state, ...currentNode.scopes]);
				const keys = json.trimEnd().split(".");
				let value = Reflect.get(data, keys[0]);
				let i = 1;
				while (i < keys.length) {
					value = Reflect.get(/** @type {object} */ (value), keys[i]);
					i++;
				}
				data = value;
			}
			currentNode.scopes.push(observe(data));

			const state = scopedState([_state, ...currentNode.scopes]);
			const init = currentNode.getAttribute("@init");

			if (init) {
				const [fnName, fnArg] = parseFnCall(init ?? "") || [];
				const fn = /** @type {Function} */ (scopedState[fnName]);
				if (fn) fn.apply(state, fnArg);
			}

			if (this.#config.clean.directives) {
				currentNode.removeAttribute("@data");
				currentNode.removeAttribute("@init");
			}

			const directiveExtraArgs =
				/** @type {import("./types.d.ts").DirectiveExtraArgs} */ ({});

			for (const plugin of _plugins) {
				/** @type {import("./types.d.ts").DirectiveExtraArgs} */
				const newDirectiveExtraArts = plugin({
					element: currentNode,
					rootState: _state,
					state,
					config: _config,
					directives: _directives,
					directiveExtraArgs,
				});
				Object.assign(directiveExtraArgs, newDirectiveExtraArts);
			}

			for (const { name, value } of currentNode.attributes) {
				if (name[0] !== "@") continue;

				if (name.startsWith("@:")) {
					// handle attribute
					watch(() =>
						currentNode.setAttribute(name.slice(2), interp(value, state)),
					);
				} else if (name.startsWith("@on:")) {
					// handle event listener
					const handler = /** @param {Event} e */ (e) => {
						const newState = scopedState([state, { $event: e }]);
						const [fnName, fnArgs] = parseFnCall(value);
						const fn = /** @type {Function} */ (newState[fnName]);
						if (fn) fn.apply(newState, fnArgs);
					};

					const event = name.slice(4);

					/** @type {VoidFunction | null} */
					let cleanup = null;

					watch(() => {
						if (cleanup) cleanup();
						currentNode.addEventListener(event, handler);
					});

					cleanup = () => currentNode.removeEventListener(event, handler);
				} else {
					const directive = /** @type {import("./types.d.ts").Directive} */ (
						{ ...directives, ..._directives }[name.slice(1)]
					);
					if (directive)
						directive({
							value,
							element: currentNode,
							state,
							config: _config,
							directives: _directives,
							rootState: _state,
							plugins: _plugins,
							...directiveExtraArgs,
						});
				}

				if (this.#config.clean.directives) currentNode.removeAttribute(name);
			} // end of loop attributes

			if (this.#config.clean.scopes) {
				if (currentNode.hasChildNodes) parentNode.scopes = [];
				else currentNode.scopes = [];
			}
			nextNode = walker.nextNode();
		} // end of loop node
	}
}
