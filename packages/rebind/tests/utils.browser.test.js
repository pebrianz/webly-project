import { interp, parseFnCall } from "@webly/rebind/utils";
import json5 from "json5";
import { describe, expect, it } from "vitest";

describe("utils", async () => {
	it("should parse function name and arguments and interpolate string argument", () => {
		const str = `sayHello("john doe", {name: "john"}, "{name}")`;
		const [name, args] = parseFnCall(str, { parse: json5.parse });

		const result = {
			name,
			args: args.map((v) =>
				typeof v === "string" ? interp(v, { name: "john" }) : v,
			),
		};

		const expectedResult = {
			name: "sayHello",
			args: ["john doe", { name: "john" }, "john"],
		};
		expect(result).toEqual(expectedResult);
	});
});
