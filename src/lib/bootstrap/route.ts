import type { IncomingHttpHeaders } from "http";
import { parse, type RouteParams } from "regexparam";
import {
	seq,
	type Apathy,
	type Handler,
	type Protocol,
	type Router,
} from "../../index.js";

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

export default function <T extends Protocol, U extends string>(
	this: Apathy<T>,
	path: U
): Router<T, U> {
	const { keys, pattern } = parse(path);

	const handlers: Handler<T, U>[] = [];

	(this as unknown as { handlers: Handler<T, U>[] }).handlers.push(
		async (event) => {
			if (pattern.test(event.url.pathname)) {
				for await (const handler of handlers) {
					await handler(event);
				}
			}
		}
	);

	const route = ({
		handler,
		keys,
		method,
		pattern,
	}: {
		handler: Handler<T, U>[];
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
						.reduce((p, c, i) => ({ ...p, [keys[i]]: c }), {} as RouteParams<U>)
				: ({} as RouteParams<U>);

			try {
				await fn({ locals, params, request, response, url });
			} catch (err) {
				console.error("Use: ", err);
			}
		});
	};

	return Object.create({
		all(...handler: Handler<T, U>[]) {
			route({ handler, keys, pattern });
			return this;
		},
		delete(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.DELETE, pattern });
			return this;
		},
		head(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.HEAD, pattern });
			return this;
		},
		get(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.GET, pattern });
			return this;
		},
		options(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.OPTIONS, pattern });
			return this;
		},
		patch(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.PATCH, pattern });
			return this;
		},
		post(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.POST, pattern });
			return this;
		},
		put(...handler: Handler<T, U>[]) {
			route({ handler, keys, method: METHODS.PUT, pattern });
			return this;
		},
		use(...handler: Handler<T, U>[]) {
			const { keys, pattern } = parse(path, true);
			route({ handler, keys, pattern });
			return this;
		},
	});
}
