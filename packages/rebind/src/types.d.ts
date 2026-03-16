/** @internal */
declare type NodeWithScopes<element extends Node = HTMLElement> = element & {
	scopes?: State[];
};

export type Directive = (params: {
	element: HTMLElement;
	value: string;
	state: ScopedState;
	rootState: State;
	plugins: Plugin[];
	config: Config;
	directives: Directives;
	[key: PropertyKey]: unknown;
}) => void;

export type Directives = Record<PropertyKey, Directive>;

declare function interp<T extends Record<PropertyKey, unknown>>(
	text: string,
	data: T,
): string;

declare function parseFnCall(
	str: string,
	json?: { parse: JsonParse; reviver: JsonReviver },
): [string, unknown[]];

declare function observe<T extends object>(target: T): T;

export type State = ReturnType<typeof observe>;

export type ScopedState = Record<PropertyKey, unknown>;

/** @internal */
type DirectiveExtraArgs = Record<PropertyKey, unknown>;

export type Plugin = (params: {
	element: HTMLElement;
	state: ScopedState;
	config: Config;
	rootState: State;
	directives: Directives;
	directiveExtraArgs: DirectiveExtraArgs;
}) => DirectiveExtraArgs;

export type JsonReviver = ((this: any, key: string, value: any) => any) | null;

export type JsonParse<T = any> = (text: string, reviver?: JsonReviver) => T;

export type Config = Partial<{
	jsonParse: JsonParse;
	jsonRevier: JsonReviver;
	clean: { scopes: boolean; directives: boolean };
}>;
