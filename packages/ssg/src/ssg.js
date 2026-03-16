import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { WorkerPool } from "./worker_pool.js";

async function loadContentPages(root) {
	const contentPath = path.resolve(root, "content");
	const entries = await fs.readdir(contentPath, {
		withFileTypes: true,
		recursive: true,
	});

	const map = /**
	 * @type {Map<string, (import("gray-matter").GrayMatterFile & {
	 *  permalink: string,
	 *  name: string,
	 *  ext: string,
	 * })[]>}
	 */ (new Map());

	for (const entry of entries) {
		if (!entry.isFile()) continue;
		const entryPath = path.join(entry.parentPath, entry.name);
		const m = matter(await fs.readFile(entryPath));

		const entryExt = path.extname(entry.name);
		const entryName = entry.name.replace(entryExt, "");
		const relativeDirPath = path.relative(contentPath, entry.parentPath);

		const data = {
			...m,
			permalink: path.resolve("/", relativeDirPath),
			name: entryName,
			ext: entryExt,
		};

		const dir = path.dirname(path.join(relativeDirPath, entryName));
		const list = map.get(dir);

		if (list) {
			list.push(data);
		} else {
			map.set(dir, [data]);
		}
	}

	return map;
}

async function runBuild({ root, outDir, worker_pool_size }) {
	const contentPages = await loadContentPages(root);
	const layouts = path.resolve(root, "layouts");

	const worker = new WorkerPool(
		new URL("./worker.js", import.meta.url),
		worker_pool_size,
	);
	const jobs = [];

	for (const [parentPath, pages] of contentPages) {
		const dirpath = path.resolve(root, path.join(outDir, parentPath));
		await fs.mkdir(dirpath, { recursive: true });

		if (pages[0].name[0] !== "_") {
			for (const { content, data, permalink, name } of pages) {
				const layoutPath = path.join(layouts, parentPath, `${name}.html`);
				const pageData = {
					content,
					data,
					permalink,
					name,
				};
				jobs.push(worker.run({ layoutPath, pageData, dirpath }));
			}
			continue;
		}

		const singleLayoutPath = path.join(layouts, parentPath, "single.html");
		const pagesData = [];
		let i = pages.length;
		while (--i > 0) {
			const { content, data, permalink, name } = pages[i];
			const pageData = {
				content,
				data,
				permalink,
				name,
			};
			pagesData.push(pageData);
			jobs.push(
				worker.run({ layoutPath: singleLayoutPath, pageData, dirpath }),
			);
		}

		const { content, data, permalink } = pages[0];

		const layoutPath = path.join(layouts, parentPath, "index.html");
		const pageData = {
			content,
			data,
			permalink,
			name: "index",
			pages: pagesData,
		};
		jobs.push(worker.run({ layoutPath, pageData, dirpath }));
	}

	for (const { html, pageData, dirpath } of await Promise.all(jobs)) {
		await fs.writeFile(path.join(dirpath, `${pageData.name}.html`), html);
	}

	await worker.destroy();
}

await runBuild({
	root: process.cwd(),
	outDir: "dist",
	worker_pool_size: 1,
});
