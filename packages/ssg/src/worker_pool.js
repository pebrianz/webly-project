import os from "node:os";
import { Worker } from "node:worker_threads";

export class WorkerPool {
	workers = [];
	queue = [];
	active = new Map();
	id = 0;

	constructor(workerFile, size = os.cpus().length - 1) {
		for (let i = 0; i < size; i++) {
			const worker = new Worker(workerFile);
			worker.on("message", (msg) => this.#handle(worker, msg));
			this.workers.push(worker);
		}
	}

	run(job) {
		return new Promise((resolve, reject) => {
			const id = ++this.id;
			this.queue.push({ id, job, resolve, reject });
			this.#dispatch();
		});
	}

	#dispatch() {
		const worker = this.workers.find((w) => !this.active.has(w));
		if (!worker || this.queue.length === 0) return;

		const task = this.queue.shift();
		this.active.set(worker, task);
		worker.postMessage({ id: task.id, ...task.job });
	}

	#handle(worker, msg) {
		const task = this.active.get(worker);
		this.active.delete(worker);

		if (msg.error) task.reject(new Error(msg.error));
		else task.resolve(msg.result);

		this.#dispatch();
	}

	async destroy() {
		await Promise.all(this.workers.map((w) => w.terminate()));
	}
}
