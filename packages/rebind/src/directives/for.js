/**
 * @typedef {import("./index.js").Directives} Directives
 * @typedef {import("../main.js").NodeWithScopes<HTMLElement>} NodeWithScopes
 */

import json5 from "json5";
import { Rebind } from "../main.js";
import { watch } from "../reactive.js";

/** @type {Directives} */
export default {
	for: ({ element, value, directives, scopedState }) => {
		const template = /** @type {HTMLTemplateElement} */ (element);

		/** @type {((f: DocumentFragment) => void) | null} */
		let update = null;

		watch(() => {
			const [key, json] = value.split(/\s+in\s+/);
			const object = json5.parse(json);
			const fragment = document.createDocumentFragment();

			for (const k in object) {
				const content = /** @type {DocumentFragment} */ (
					template.content.cloneNode(true)
				);
				const firstElementChild =
					/** @type {NodeWithScopes & {template: HTMLTemplateElement}} */ (
						content.firstElementChild
					);

				const data = { $key: k, [`${key}`]: object[k] };

				if (!firstElementChild.scopes) firstElementChild.scopes = [];

				firstElementChild.scopes.push(scopedState);
				firstElementChild.scopes.push(data);
				firstElementChild.template = template;

				fragment.appendChild(firstElementChild);
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
