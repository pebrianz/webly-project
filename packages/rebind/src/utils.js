import json5 from "json5";

/**
 * @param {import("./types.d.ts").State[]} scopes
 * @returns {Record<string,unknown>}
 */
export function createScopedState(scopes) {
	return new Proxy(
		{},
		{
			get(_, propertyKey) {
				let i = scopes.length;
				while (i--) {
					const state = /** @type {object} */ (scopes[i]);
					const result = Reflect.get(state, propertyKey);
					if (result !== undefined) return result;
				}
			},

			set(_, propertyKey, newValue) {
				let i = scopes.length;
				while (i--) {
					const state = /** @type {object} */ (scopes[i]);
					const oldValue = state[propertyKey];
					if (oldValue === undefined) continue;
					return Reflect.set(state, propertyKey, newValue);
				}
				return false;
			},
		},
	);
}

/**
 * @param {string} text
 * @param {object} data
 */
export function interpolate(text, data) {
	return text.replace(/{([\w_$]+[.\w\d]*)}/g, (substring) => {
		const keys = substring.slice(1, -1).split(".");
		let value = Reflect.get(data, keys[0]);
		let i = 1;
		while (i < keys.length) {
			value = Reflect.get(value, keys[i]);
			i++;
		}
		return value;
	});
}

/**
 * @param {string} str
 * @returns [string, unknown[]]
 */
export function parseFunctionCall(str) {
	const [name, strArgs] = str.trim().split(/[()]/);
	if (!name) return ["", []];
	const args = json5.parse(`[${strArgs.split(",").join(",")}]`);
	return [name, args];
}
