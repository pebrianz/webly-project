export type Params = Record<string, unknown>;
export type Path = `/${string}`;

export type Routes = Record<
	Path,
	| {
			component: CustomElementConstructor;
			params?: Params;
	  }
	| {
			component: (this: { params: any }) => Promise<CustomElementConstructor>;
			params?: Params;
	  }
>;

