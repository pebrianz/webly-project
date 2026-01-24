export type Params = Record<string, unknown>;
export type Path = `/${string}`;

export type Routes = Record<
	Path,
	CustomElementConstructor | (() => Promise<CustomElementConstructor>)
>;
