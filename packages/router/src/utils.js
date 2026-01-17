/**
 * @typedef {import("./main.js").Params} Params
 * @typedef {import("./main.js").Path} Path
 * @typedef {import("./main.js").Routes} Routes
 */

/** @param {CustomElementConstructor} componentConstructor */
export function defineComponent(componentConstructor) {
	if (customElements.getName(componentConstructor)) return;
	customElements.define(
		toKebabCase(componentConstructor.name),
		componentConstructor,
	);
}

/**
 * @param {HTMLElement} component
 * @param {NodeListOf<ChildNode>} childNodes
 * @returns {void}
 */
export function moveChildNodes(component, childNodes) {
	if (childNodes.length !== 0) {
		if (!(component.shadowRoot instanceof ShadowRoot)) {
			component.replaceChildren(...childNodes);
		}
	}
}

export function isClassConstructor(ctr) {
	if (typeof ctr !== "function") return false;
	try {
		ctr();
		return false;
	} catch (_) {
		return true;
	}
}

/** @param {string} str */
export function toKebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * @param {string[]} paramNames
 * @param {RegExpMatchArray} match
 * @returns {Params}
 */
export function extractParams(paramNames, match) {
	const params = /** @type {Params} */ ({});
	paramNames.forEach((name, index) => {
		params[name] = match[index + 1];
	});
	return params;
}

/**
 * @param {string} path
 * @returns {RegExp}
 */
export function createRegexFromDynamicPath(path) {
	return new RegExp(`^${path.replace(/(:\w+)/g, "([\\w-_]+)")}$`);
}

/**
 * @param {string} path
 * @returns {string[]}
 */
export function extractParamNames(path) {
	return /** @type {string[]} */ (path.match(/:\w+/g) || []).map((param) =>
		param.substring(1),
	);
}

/**
 * @param {string} path
 * @param {{ path:string } & Routes[Path]} route
 */
export function matchPathToDynamicRoute(path, route) {
	const regex = createRegexFromDynamicPath(route.path);
	const match = path.match(regex);
	if (!match) return null;
	const paramNames = extractParamNames(route.path);
	const params = extractParams(paramNames, match);
	return {
		component: route.component,
		path: path,
		params: { ...route.params, ...params },
	};
}

/**
 * @param {Routes} routes
 * @param {string} [path]
 */
export function matchDynamicRoute(routes, path) {
	if (!path) return null;

	for (const [routePath, route] of Object.entries(routes)) {
		const result = matchPathToDynamicRoute(path, { ...route, path: routePath });
		if (!result) continue;
		return result;
	}

	return null;
}
