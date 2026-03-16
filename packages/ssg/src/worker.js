import fs from "node:fs/promises";
import { parentPort } from "node:worker_threads";

import { Rebind } from "@webly/rebind";
import json5 from "json5";
import "./window.js";

import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";

const marked = new Marked(
	markedHighlight({
		emptyLangClass: "hljs",
		langPrefix: "hljs language-",
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			return hljs.highlight(code, { language }).value;
		},
	}),
);

parentPort.on("message", async (msg) => {
	const { layoutPath, pageData, dirpath } = msg;
	const content = await marked.parse(pageData.content);

	document.documentElement.innerHTML = await fs.readFile(layoutPath, {
		encoding: "utf8",
	});

	new Rebind(document.documentElement)
		.config({ jsonParse: json5.parse })
		.state({ ...msg.pageData, content })
		.run();

	// @ts-expect-error
	await window.happyDOM.waitUntilComplete();
	const html = document.documentElement.outerHTML;
	parentPort.postMessage({ result: { html, pageData, dirpath } });
});
