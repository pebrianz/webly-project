import { watch } from "../reactive.js";
import { createScopedState, parseFunctionCall } from "../utils.js";

const globalEvents =
	/** @type {(keyof GlobalEventHandlersEventMap)[]} */
	[
		"abort",
		"animationcancel",
		"animationend",
		"animationiteration",
		"animationstart",
		"auxclick",
		"beforeinput",
		"beforetoggle",
		"blur",
		"cancel",
		"canplay",
		"canplaythrough",
		"change",
		"click",
		"close",
		"compositionend",
		"compositionstart",
		"compositionupdate",
		"contextlost",
		"contextmenu",
		"contextrestored",
		"copy",
		"cuechange",
		"cut",
		"dblclick",
		"drag",
		"dragend",
		"dragenter",
		"dragleave",
		"dragover",
		"dragstart",
		"drop",
		"durationchange",
		"emptied",
		"ended",
		"error",
		"focus",
		"focusin",
		"focusout",
		"formdata",
		"gotpointercapture",
		"input",
		"invalid",
		"keydown",
		"keypress",
		"keyup",
		"load",
		"loadeddata",
		"loadedmetadata",
		"loadstart",
		"lostpointercapture",
		"mousedown",
		"mouseenter",
		"mouseleave",
		"mousemove",
		"mouseout",
		"mouseover",
		"mouseup",
		"paste",
		"pause",
		"play",
		"playing",
		"pointercancel",
		"pointerdown",
		"pointerenter",
		"pointerleave",
		"pointermove",
		"pointerout",
		"pointerover",
		"pointerup",
		"progress",
		"ratechange",
		"reset",
		"resize",
		"scroll",
		"scrollend",
		"securitypolicyviolation",
		"seeked",
		"seeking",
		"select",
		"selectionchange",
		"selectstart",
		"slotchange",
		"stalled",
		"submit",
		"suspend",
		"timeupdate",
		"toggle",
		"touchcancel",
		"touchend",
		"touchmove",
		"touchstart",
		"transitioncancel",
		"transitionend",
		"transitionrun",
		"transitionstart",
		"volumechange",
		"waiting",
		"webkitanimationend",
		"webkitanimationiteration",
		"webkitanimationstart",
		"webkittransitionend",
		"wheel",
	];

/**
 * @internal
 * @type {import("../types.d.ts").Directives}
 */
export default globalEvents.reduce((events, event) => {
	return Object.assign(
		events,
		/** @type {import("../types.d.ts").Directives} */ ({
			[`on${event}`]({ element, value, scopes, rootState }) {
				const handler = /** @param {Event} e */ (e) => {
					const scopedState = createScopedState([
						rootState,
						...scopes,
						{ $event: e },
					]);
					const [fnName, fnArgs] = parseFunctionCall(value);
					const fn = /** @type {Function} */(scopedState[fnName]);
					if (fn) fn.apply(scopedState, fnArgs);
				};

				/** @type {VoidFunction | null} */
				let cleanup = null;

				watch(() => {
					if (cleanup) cleanup();
					element.addEventListener(event, handler);
				});

				cleanup = () => {
					element.removeEventListener(event, handler);
				};
			},
		}),
	);
}, {});
