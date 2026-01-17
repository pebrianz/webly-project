export function interpolate(text:string, data: object): string

export function parseFunctionCall(str:string): [string, unknown[]]

export type Directive = (params: {
	element: HTMLElement;
	value: string;
	scopedState: ScopedState;
	rootState: State;
	scopes: State[];
	plugins: Plugin[];
	directives: Directives;
	[key: string]: unknown;
}) => void;

export type Directives = Record<string, Directive>;

export function watch(effect: VoidFunction): void;

export function observe<T extends object>(target: T): T;

export type State = ReturnType<observe>;

export function createScopedState(scopes: State[]): Record<string, unknown>;

export type ScopedState = ReturnType<createScopedState>;

type DirectiveExtraArgs = Record<string, unknown>;

export type Plugin = (params: {
	element: HTMLElement;
	scopedState: ScopedState;
	rootState: State;
	scopes: State[];
	directives: Directives;
	directiveExtraArgs: DirectiveExtraArgs;
}) => DirectiveExtraArgs;

export class Rebind {
	constructor(selectors: Node | string);
	state(...state: State[]): this;
	plugin(plugin: Plugin[]): this;
	directives(directives: Directives): this;
	run(): Promise<void>;
}

