import { observe, Rebind, watch } from "@webly/rebind";
import {
	defineComponent,
	isClassConstructor,
	matchDynamicRoute,
} from "./utils.js";

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
	 * @type {{ view: import("./types.d.ts").Routes[keyof import("./types.d.ts").Routes] }}
	 */
	#currentRoute = observe({ view: null });

	/** @param {HTMLElement} root */
	constructor(root) {
		this.#root = root;

		new Rebind(this.#root)
			.directives({
				"router-view": ({ element }) => {
					const fragmentChildNodes = document.createDocumentFragment();
					fragmentChildNodes.append(...element.childNodes);

					watch(async () => {
						const componentConstructor = this.#currentRoute.view;
						if (!componentConstructor) return;
						let constr = /** @type {CustomElementConstructor} */ (
							componentConstructor
						);

						if (!isClassConstructor(componentConstructor)) {
							constr = await componentConstructor.call();
						}

						defineComponent(constr);

						const component = new constr();

						new Rebind(component)
							.state(Object.freeze({ $params: this.#params }))
							.run();

						if (!document.startViewTransition) {
							element.replaceChildren(component);
							return;
						}

						document.startViewTransition(() =>
							element.replaceChildren(component),
						);
					});
				},
			})
			.run();
	}

	/** @param {import("./types.d.ts").Routes} routes */
	routes(routes) {
		this.#routes = routes;
		return this;
	}

	/** @returns {void} */
	start() {
		this.navigate(
			/** @type {import("./types.d.ts").Path} */ (window.location.pathname),
		);
		window.addEventListener("popstate", () => {
			const path = /** @type {import("./types.d.ts").Path} */ (
				window.location.pathname
			);
			this.navigate(path, null, "none");
		});
	}

	/**
	 * @param {import("./types.d.ts").Path} path
	 * @param {unknown} data
	 * @param {keyof typeof navigateType} type
	 */
	navigate(path, data = null, type = "push") {
		const component = this.#routes[path];

		if (component != null) {
			this.#currentRoute.view = component;
		} else {
			const route = matchDynamicRoute(this.#routes, path);
			this.#params = route.params;
			this.#currentRoute.view = component;
		}

		navigateType[type](
			/** @type {import("./types.d.ts").Path} */ (path ?? "/"),
			data,
		);
	}
}
