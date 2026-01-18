/// <reference types="vite/client" />

type NodeWithScopes<element extends Node = HTMLElement> = element & {
	scopes?: State[];
};

type Directive = (params: {
	element: HTMLElement;
	value: string;
	scopedState: ScopedState;
	rootState: State;
	scopes: State[];
	plugins: Plugin[];
	directives: Directives;
	[key: string]: unknown;
}) => void;

type Directives = Record<string, Directive>;

export function observe<T extends object>(target: T): T;

type State = ReturnType<typeof observe>;

export function createScopedState(scopes: State[]): Record<string, unknown>;

type ScopedState = ReturnType<typeof createScopedState>;

type DirectiveExtraArgs = Record<string, unknown>;

type Plugin = (params: {
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
