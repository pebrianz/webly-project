/**
 * @param {import("./types.d.ts").State[]} scopes
 * @returns {Record<PropertyKey,unknown>}
 */
export function scopedState(scopes) {
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

/** @type {import("./types.d.ts").interp} */
export function interp(text, data) {
	return text.replace(/{([\w_$]+[.\w\d]*)}/g, (substring) => {
		const keys = substring.slice(1, -1).split(".");
		let value = Reflect.get(data, keys[0]);
		let i = 1;
		while (i < keys.length) {
			value = Reflect.get(data, keys[i]);
			i++;
		}
		return `${value}`;
	});
}

/** @type {import("./types.d.ts").parseFnCall} */
export function parseFnCall(
	str,
	json = { parse: JSON.parse, reviver: (_, value) => value },
) {
	const [name, strArgs] = str.trim().split(/[()]/);
	if (!name) return ["", []];
	const args = json.parse(`[${strArgs.split(",").join(",")}]`, json.reviver);
	return [name, args];
}
