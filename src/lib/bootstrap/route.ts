import type { IncomingHttpHeaders } from "http";
import { parse, type RouteParams } from "regexparam";
import type { Apathy, Handler, Router } from "../../index.js";

const seq =
	<T extends string>(...handler: Handler<T>[]): Handler<T> =>
	async (event) => {
		for await (const fn of handler) {
			await fn(event);
		}
	};

const METHODS = {
	DELETE: "DELETE",
	GET: "GET",
	HEAD: "HEAD",
	OPTIONS: "OPTIONS",
	PATCH: "PATCH",
	POST: "POST",
	PUT: "PUT",
} as const;

type Method = keyof typeof METHODS;

const urlFrom = (request: { headers: IncomingHttpHeaders; url?: string }) => {
	const {
		headers: { ":authority": authority, ":scheme": scheme = "http", host },
		url = "/",
	} = request;

	return new URL(url, `${scheme}://${authority ?? host}`);
};

export default function <T extends string>(this: Apathy, path: T): Router<T> {
	const { keys, pattern } = parse(path);

	const handlers: Handler<T>[] = [];

	(this as unknown as { handlers: Handler<T>[] }).handlers.push(
		async (event) => {
			if (pattern.test(event.url.pathname)) {
				for await (const handler of handlers) {
					await handler(event);
				}
			}
		}
	);

	const route = <T extends string>({
		handler,
		keys,
		method,
		pattern,
	}: {
		handler: Handler<T>[];
		keys: false | string[];
		method?: Method;
		pattern: RegExp;
	}) => {
		const fn = handler.length === 1 ? handler[0] : seq(...handler);

		handlers.push(async ({ locals, request, response, url }) => {
			if (method && method !== request.method) {
				return;
			}

			if (pattern.test(url.pathname) === false) {
				return;
			}

			const params = keys
				? (pattern.exec(url.pathname) ?? [])
						.slice(1)
						.reduce((p, c, i) => ({ ...p, [keys[i]]: c }), {} as RouteParams<T>)
				: ({} as RouteParams<T>);

			try {
				await fn({ locals, params, request, response, url });
			} catch (err) {
				console.error("Use: ", err);
			}
		});
	};

	return Object.create({
		all(...handler: Handler<T>[]) {
			route({ handler, keys, pattern });
			return this;
		},
		delete(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.DELETE, pattern });
			return this;
		},
		head(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.HEAD, pattern });
			return this;
		},
		get(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.GET, pattern });
			return this;
		},
		options(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.OPTIONS, pattern });
			return this;
		},
		patch(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.PATCH, pattern });
			return this;
		},
		post(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.POST, pattern });
			return this;
		},
		put(...handler: Handler<T>[]) {
			route({ handler, keys, method: METHODS.PUT, pattern });
			return this;
		},
		use(...handler: Handler<T>[]) {
			const { keys, pattern } = parse(path, true);
			route({ handler, keys, pattern });
			return this;
		},
	});
}
