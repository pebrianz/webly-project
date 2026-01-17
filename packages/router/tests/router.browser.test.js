import { describe, it, expect } from "vitest";
import dedent from "dedent";
import { Router } from "../dist/index.js";

describe("router", async () => {
	it("should render correct component for the given route", async () => {
		class AppRoot extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open", serializable: true });
				this.shadowRoot.innerHTML = dedent`<main @router-view><main>`;
			}
		}

		class AppHome extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open", serializable: true });
				this.shadowRoot.innerHTML = dedent`<h1 @text="hello">Hello World</h1>`;
			}
		}

		new Router(AppRoot)
			.routes({
				"/": {
					params: { title: "HomePage" },
					component: async () => {
						return AppHome;
					},
				},
			})
			.mount(document.body);

		await Promise.resolve();

		const renderedResult = document.body.getHTML({
			serializableShadowRoots: true,
		});
		const expectedResult =
			dedent`<app-root>` +
			`<template shadowrootmode="open" shadowrootserializable="">` +
			`<main @router-view="">` +
			`<app-home>` +
			`<template shadowrootmode="open" shadowrootserializable="">` +
			`<h1 @text="hello">Hello World</h1>` +
			`</template></app-home>` +
			`</main></template></app-root>`;
		expect(renderedResult).toBe(expectedResult);
	});
});
