// @ts-check
import { observe, Rebind } from "@webly/rebind";
import dedent from "dedent";
import json5 from "json5";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("core", async () => {
	it("should set textContent based on @text directive", () => {
		document.body.innerHTML = `<div @text="Hello World"></div>`;

		new Rebind(document.body).run();

		const renderedText = document.body.firstElementChild?.textContent;
		const expectedText = "Hello World";
		expect(renderedText).toBe(expectedText);
	});

	it("should interpolate @text directive using parent @data context", () => {
		document.body.innerHTML = dedent`
			<div @data='{"name": "Foo", "country": "Bar"}'>
				<p @text="Hello {name} from {country}"><p/>
			</div>
		`;

		new Rebind(document.body).run();

		const renderedText = document.querySelector("p")?.textContent;
		const expectedText = "Hello Foo from Bar";
		expect(renderedText).toBe(expectedText);
	});

	it("should update text when state change", () => {
		const state = observe({
			count: 0,
		});

		document.body.innerHTML = dedent`
			<p @text="{count}"></p>
		`;

		new Rebind(document.body).state(state).run();

		const p = document.querySelector("p");
		let renderedText = p?.textContent;
		let expectedText = "0";
		expect(renderedText).toBe(expectedText);

		state.count++;

		renderedText = p?.textContent;
		expectedText = "1";
		expect(renderedText).toBe(expectedText);
	});

	it("should call function from data when @onclick is triggered", async () => {
		const rootData = observe({
			count: 0,
			increment() {
				this.count += 1;
			},
		});
		document.body.innerHTML = `<button @on:click="increment()" @text="{count}"></button>`;

		new Rebind(document.body).state(rootData).run();

		const button = document.querySelector("button");
		button?.click();
		expect(button?.textContent).toBe("1");
	});

	it("should inherit and override @data", () => {
		const rootData = {
			isInherited: false,
			root: true,
		};

		document.body.innerHTML = dedent`
	     <div @data="{ isOverrided: false, isInherited: true }">
	       <div @data="{ isOverrided: true }">
	         <p @text="is overrided? {isOverrided}, is inherited? {isInherited}, and is have value from root? {root}"></p>
	       </div>
	     </div>
	   `;

		new Rebind(document.body)
			.state(rootData)
			.config({ jsonParse: json5.parse })
			.run();

		const renderedText = document.querySelector("p")?.textContent;
		const expectedText =
			"is overrided? true, is inherited? true, and is have value from root? true";
		expect(renderedText).toBe(expectedText);
	});

	it("should render the item from @for template loop", () => {
		document.body.innerHTML = dedent`
	     <ul>
	       <template @for='animal in ["cat","husky"]'>
	         <li @text="{animal}">item</li>
	       </template>
	     </ul>
	   `;

		new Rebind(document.body).run();
		document.querySelector("template")?.remove();

		const renderedResult = document.body.firstElementChild?.innerHTML;
		const expectedResult = `<li>cat</li><li>husky</li>`;
		expect(dedent(renderedResult ?? "")).toBe(expectedResult);
	});

	it("should conditionally render and toggle visibility using @if and method call", () => {
		const rootData = {
			show() {
				const p = document.querySelector("p");
				if (p) p.hidden = !p.hidden;
			},
		};

		document.body.innerHTML = dedent`
	     <div @if="5 < 10; show()">
	       <p hidden>hello world</p>
	     </div>
	   `;

		new Rebind(document.body).state(rootData).run();

		const renderedResult = document.body.firstElementChild?.innerHTML;
		const expectedResult = "<p>hello world</p>";
		expect(dedent(renderedResult ?? "")).toBe(expectedResult);
	});

	// it("should render the item with the given @range", () => {
	// 	document.body.innerHTML = dedent`
	//      <ul>
	//        <template @range="2 as x">
	//          <li @text="{x}">item</li>
	//        </template>
	//      </ul>
	//    `;

	// 	new Rebind(document.body).run();
	// 	document.querySelector("template")?.remove();

	// 	const renderedResult = document.body.firstElementChild?.innerHTML;
	// 	const expectedResult = `<li @text="{x}">0</li><li @text="{x}">1</li>`;
	// 	expect(dedent(renderedResult ?? "")).toBe(expectedResult);
	// });
});
