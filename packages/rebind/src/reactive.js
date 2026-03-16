/** @type {WeakMap<object, Map<string | symbol, Set<() => void>>>} */
const targetMap = new WeakMap();

/** @type {VoidFunction | null} */
let activeEffect = null;

/** @param {VoidFunction} effect */
export function watch(effect) {
	activeEffect = effect;
	effect();
	activeEffect = null;
}

/**
 * @param {object} target
 * @param {string | symbol} key
 */
function track(target, key) {
	if (!activeEffect) return;
	let depsMap = targetMap.get(target);
	if (!depsMap) {
		depsMap = new Map();
		targetMap.set(target, depsMap);
	}
	let dep = depsMap.get(key);
	if (!dep) {
		dep = new Set();
		depsMap.set(key, dep);
	}
	dep.add(activeEffect);
}

/**
 * @param {object} target
 * @param {string | symbol} key
 */
function trigger(target, key) {
	const depsMap = targetMap.get(target);
	if (!depsMap) return;
	const dep = depsMap.get(key);
	if (dep) for (const eff of dep) eff();
}

/** @type {import("./types.d.ts").observe} */
export function observe(target) {
	if (typeof target !== "object" || target === null) return target;
	return new Proxy(target, {
		get(obj, key, receiver) {
			const result =
				obj instanceof Node ? obj : Reflect.get(obj, key, receiver);
			track(obj, key);
			return typeof result === "object" && result !== null
				? observe(result)
				: result;
		},
		set(obj, key, newValue, receiver) {
			const oldValue = obj;
			if (obj instanceof Node) {
				obj = newValue;
				if (oldValue !== newValue) trigger(obj, key);
				return true;
			}
			const result = Reflect.set(obj, key, newValue, receiver);
			if (oldValue !== newValue) trigger(obj, key);
			return result;
		},
	});
}
