import { describe, it, expect } from "vitest";
import dedent from "dedent";
import { Router } from "../dist/index.js";

describe("router", async () => {
	it("should render correct component for the given route", async () => {
		document.body.innerHTML = dedent`
			<main @router-view></main>
		`
		class AppHome extends HTMLElement {
			constructor() {
				super();
				this.innerHTML = dedent`<h1 @text="Hello World">hello</h1>`;
			}
		}

		new Router(document.body)
			.routes({
				"/":  async () => AppHome,
			})
			.start();

		await Promise.resolve();

		const renderedResult = document.body.getHTML({
			serializableShadowRoots: true,
		});
		const expectedResult =
			dedent`<main @router-view="">` +
			`<app-home>` +
			`<h1 @text="Hello World">Hello World</h1>` +
			`</app-home>` +
			`</main>`;
		expect(renderedResult).toBe(expectedResult);
	});
});
