import { Rebind, observe, watch } from "@webly/rebind";
import { isClassConstructor } from "./utils.js";
import { defineComponent, matchDynamicRoute, moveChildNodes } from "./utils.js";

const navigateType = {
	/**
	 * @param {import("./types.d.ts").Path} path
	 * @param {unknown} data
	 */
	replace(path, data) {
		window.history.replaceState(data, "", path);
	},
	/**
	 * @param {import("./types.d.ts").Path} path
	 * @param {unknown} data
	 */
	push(path, data) {
		window.history.pushState(data, "", path);
	},
	back() {
		window.history.back();
	},
	none() {
		return;
	},
};

export class Router {
	/**
	 * @internal
	 * @type {HTMLElement}
	 */
	#root;

	/**
	 * @internal
	 * @type {import("./types.d.ts").Routes}
	 */
	#routes;

	/**
	 * @internal
	 * @type {import("./types.d.ts").Params}
	 */
	#params;

	/**
	 * @internal
	 * @type {{ view: import("./types.d.ts").Routes[keyof import("./types.d.ts").Routes]["component"] }}
	 */
	#currentRoute = observe({ view: null });

	/** @param {CustomElementConstructor} root */
	constructor(root) {
		defineComponent(root);
		this.#root = new root();

		new Rebind(this.#root.shadowRoot)
			.directives({
				"router-view": ({ element }) => {
					/** @type {((c: HTMLElement) => void) | null} */
					let update = null;

					const fragmentChildNodes = document.createDocumentFragment();
					fragmentChildNodes.append(...element.childNodes);

					watch(async () => {
						const componentConstructor = this.#currentRoute.view;
						if (!componentConstructor) return;

						let constr = /** @type {CustomElementConstructor} */ (
							componentConstructor
						);

						if (!isClassConstructor(componentConstructor)) {
							constr = await componentConstructor.bind({
								params: this.#params,
							})();
						}

						defineComponent(constr);

						const component = new constr();

						if (update) return update(component);
						moveChildNodes(component, element.childNodes);

						element.replaceChildren(component);
					});

					update = (component) => {
						if (element.firstElementChild) {
							moveChildNodes(component, element.firstElementChild.childNodes);
						}
						element.replaceChildren(component);
					};
				},
			})
			.run();
	}

	/** @param {import("./types.d.ts").Routes} routes */
	routes(routes) {
		this.#routes = routes;
		return this;
	}

	/** @param {Node | string} selectors */
	mount(selectors) {
		const root =
			selectors instanceof Node ? selectors : document.querySelector(selectors);

		root.appendChild(this.#root);

		this.navigate(
			/** @type {import("./types.d.ts").Path} */ (window.location.pathname),
		);
		window.addEventListener("popstate", () => {
			const path = /** @type {import("./types.d.ts").Path} */ (
				window.location.pathname
			);
			this.navigate(path, null, "none");
		});
		return this;
	}

	/**
	 * @param {import("./types.d.ts").Path} path
	 * @param {unknown} data
	 * @param {keyof typeof navigateType} type
	 */
	navigate(path, data = null, type = "push") {
		const route = this.#routes[path] ?? matchDynamicRoute(this.#routes, path);

		this.#params = route?.params ?? {};
		this.#currentRoute.view = route.component;
		navigateType[type](
			/** @type {import("./types.d.ts").Path} */ (path ?? "/"),
			data,
		);
	}
}
