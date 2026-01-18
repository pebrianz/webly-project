export const directives = /** @type {import("../types.d.ts").Directives} */({});

const directiveModules = import.meta.glob(["./*.js", "!./index.js"], {
	import: "default",
	eager: true,
});

for (const key in directiveModules)
	Object.assign(directives, directiveModules[key]);
