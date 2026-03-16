import { watch } from "./reactive.js";
import { Rebind } from "./rebind.js";
import { interp, isJSON, parseFnCall } from "./utils.js";

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

/**
 * @type {import("./types.d.ts").Directives}
 */
export const directives = {
	text: ({ element, value, state }) => {
		watch(() => {
			const result = interp(value, state);
			element.textContent = result;
		});
	},
	if: ({ value, state, config }) => {
		const [condition, func] = value?.split(/\s*;\s*/) ?? ["false", ""];
		const [a, o, b] = condition.split(/\s+/);
		const jsonParser = config.jsonParse;

		watch(() => {
			const opA = jsonParser(interp(a, state));
			const opB = jsonParser(interp(b, state));

			const bool = operators[o](opA, opB) ?? false;

			if (!bool) return;

			const [fnName, fnArgs] = parseFnCall(func);
			const fn = /** @type {Function} */ (state[fnName]);
			if (fn) fn.apply(state, fnArgs);
		});
	},
	"use-template": ({ element, value }) => {
		watch(() => {
			const template = /** @type {HTMLTemplateElement} */ (
				document.querySelector(value)
			);
			element.replaceChildren(document.importNode(template.content, true));
		});
	},
	html: ({ element, value, state }) => {
		watch(() => {
			const html =
				value[0] === "{" && value[value.length - 1] === "}"
					? interp(value, state)
					: value;
			element.innerHTML = html;
		});
	},
	for: ({ element, value, directives, state, config, plugins }) => {
		const template = /** @type {HTMLTemplateElement} */ (element);

		/** @type {((f: DocumentFragment) => void) | null} */
		let update = null;

		watch(() => {
			const [key, json] = value.split(/\s+in\s+/);
			let object;
			if (isJSON(json)) {
				object = config.jsonParse(json, config.jsonRevier);
			} else {
				object = state[json.trimEnd()];
			}
			const fragment = document.createDocumentFragment();

			for (const k in object) {
				const content = /** @type {DocumentFragment} */ (
					template.content.cloneNode(true)
				);
				const firstElementChild =
					/** @type {import("./types.d.ts").NodeWithScopes & {template: HTMLTemplateElement}} */ (
						content.firstElementChild
					);

				const data = { $key: k, [`${key}`]: object[k] };

				if (!firstElementChild.scopes) firstElementChild.scopes = [];

				firstElementChild.scopes.push(state);
				firstElementChild.scopes.push(data);
				firstElementChild.template = template;

				fragment.appendChild(firstElementChild);
			}

			if (update) update(fragment);

			if (!template.parentElement) return;
			template.parentElement.appendChild(fragment);
		});

		update = async (fragment) => {
			new Rebind(fragment)
				.directives(directives)
				.config({ ...config })
				.state(state)
				.plugins(plugins)
				.run();

			const tmp = document.createDocumentFragment();

			function nextElementSibling() {
				return /** @type {Element & { template: Element}} */ (
					template.nextElementSibling
				);
			}

			while (nextElementSibling()?.template) {
				const nextSibling = nextElementSibling();

				if (nextSibling.template.isEqualNode(template)) {
					tmp.appendChild(nextSibling);
				}
			}
		};
	},
};
