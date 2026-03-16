// @ts-nocheck
import { Window } from "happy-dom";

const window = new Window({
	settings: {
		enableJavaScriptEvaluation: true,
		suppressInsecureJavaScriptEnvironmentWarning: true,
	},
});

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
