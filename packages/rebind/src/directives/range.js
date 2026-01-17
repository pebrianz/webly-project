/**
 * @typedef {import("./index.js").Directives} Directives
 * @typedef {import("../main.js").NodeWithScopes<HTMLElement>} NodeWithScopes
 */

import { Rebind } from "../main.js";
import { interpolate } from "../utils.js";
import { watch } from "../reactive.js";

/** @type {Directives} */
export default {
	range: ({ element, value, directives, scopedState }) => {
		const template = /** @type {HTMLTemplateElement} */ (element);

		/** @type {((f: DocumentFragment) => void) | null} */
		let update = null;

		watch(() => {
			const [number, variableName] = value.split(/\s+as\s+/);

			const limit = +interpolate(number, scopedState);
			const fragment = document.createDocumentFragment();

			if (Number.isNaN(limit))
				throw new Error(`'${number}' is not type of number`);

			let i = 0;
			while (i < limit) {
				const content = /** @type {DocumentFragment} */ (
					template.content.cloneNode(true)
				);
				const firstElementChild =
					/** @type {NodeWithScopes & {template: HTMLTemplateElement}} */ (
						content.firstElementChild
					);

				const outerRange = scopedState["$range"] ?? [0, 0];

				if (!firstElementChild.scopes) firstElementChild.scopes = [];

				const data = {
					$index: outerRange[0] * limit + i,
					$range: [i, limit],
				};

				if (variableName) data[variableName] = i;

				firstElementChild.scopes.push(scopedState);
				firstElementChild.scopes.push(data);
				firstElementChild.template = template;

				fragment.appendChild(firstElementChild);
				i++;
			}

			if (update) update(fragment);

			if (!template.parentElement) return;
			template.parentElement.appendChild(fragment);
		});

		update = (fragment) => {
			new Rebind(fragment).directives(directives).run();
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
