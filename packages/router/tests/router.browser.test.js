import { Router } from "@webly/router/bundle";
import dedent from "dedent";
import { describe, expect, it } from "vitest";

describe("router", async () => {
	it("should render correct component for the given route", async () => {
		document.body.innerHTML = dedent`
			<main @router-view></main>
		`;
		class AppHome extends HTMLElement {
			constructor() {
				super();
				this.innerHTML = dedent`<h1 @text="Hello World">hello</h1>`;
			}
		}

		new Router(document.body)
			.routes({
				"/": async () => AppHome,
			})
			.start();

		await Promise.resolve();

		const renderedResult = document.body.getHTML({
			serializableShadowRoots: true,
		});
		const expectedResult =
			dedent`<main>` +
			`<app-home>` +
			`<h1>Hello World</h1>` +
			`</app-home>` +
			`</main>`;
		expect(renderedResult).toBe(expectedResult);
	});
});
