import { createSecureServer } from "node:http2";
import { parse, type RouteParams } from "regexparam";

export interface Locals {}

export type Options = import("node:http2").SecureServerOptions;
export type Request = import("node:http2").Http2ServerRequest;
export type Response = import("node:http2").Http2ServerResponse;

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

export type ErrorCallback = (err?: Error) => void;

export type ListenCallback = (args: {
	address: string | import("node:net").AddressInfo | null;
	listening: boolean;
}) => void;

export type RequestCallback<T extends string> = (event: {
	locals: Locals;
	params: RouteParams<T>;
	request: Request;
	response: Response;
	url: URL;
}) => void;

interface Router<T extends string> {
	all(...callback: RequestCallback<T>[]): Router<T>;
	delete(...callback: RequestCallback<T>[]): Router<T>;
	get(...callback: RequestCallback<T>[]): Router<T>;
	head(...callback: RequestCallback<T>[]): Router<T>;
	options(...callback: RequestCallback<T>[]): Router<T>;
	patch(...callback: RequestCallback<T>[]): Router<T>;
	post(...callback: RequestCallback<T>[]): Router<T>;
	put(...callback: RequestCallback<T>[]): Router<T>;
	use(...callback: RequestCallback<T>[]): Router<T>;
}

interface Server {
	/**
	 * Stops the server from accepting new connections and keeps existing
	 * connections.
	 */
	close(callback?: ErrorCallback): void;

	error(callback: ErrorCallback): Server;

	/**
	 * Start a server listening for connections.
	 */
	listen(callback?: ListenCallback): void;
	listen(port: number, callback?: ListenCallback): void;
	listen(port: number, host: string, callback?: ListenCallback): void;

	route<T extends string>(path: T): Router<T>;

	all<T extends string>(...callback: RequestCallback<T>[]): Server;
	all<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	delete<T extends string>(...callback: RequestCallback<T>[]): Server;
	delete<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP GET requests for the default path.
	 */
	get<T extends string>(...callback: RequestCallback<T>[]): Server;
	get<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP HEAD requests for the default path.
	 */
	head<T extends string>(...callback: RequestCallback<T>[]): Server;
	head<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP OPTIONS requests for the default path.
	 */
	options<T extends string>(...callback: RequestCallback<T>[]): Server;
	options<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP PATCH requests for the default path.
	 */
	patch<T extends string>(...callback: RequestCallback<T>[]): Server;
	patch<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP POST requests for the default path.
	 */
	post<T extends string>(...callback: RequestCallback<T>[]): Server;
	post<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	/**
	 * Registers a callback to handle HTTP PUT requests for the default path.
	 */
	put<T extends string>(...callback: RequestCallback<T>[]): Server;
	put<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;

	use<T extends string>(...callback: RequestCallback<T>[]): Server;
	use<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
}

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been resolved.
 */
export const all =
	<T extends string>(...callback: RequestCallback<T>[]): RequestCallback<T> =>
	(event) =>
		Promise.all(callback.map((fn) => fn(event)));

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been settled.
 */
export const any =
	<T extends string>(...callback: RequestCallback<T>[]): RequestCallback<T> =>
	(event) =>
		Promise.allSettled(callback.map((fn) => fn(event)));

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when the first callback is resolved.
 *
 * @example
 * ```js
 * const getFromCache = async (event) => { ... }
 * const getFromRemove = async (event) => { ... }
 *
 * app.get("/posts/:id", one(getFromCache, getFromRemote));
 * ```
 */
export const one =
	<T extends string>(...callback: RequestCallback<T>[]): RequestCallback<T> =>
	(event) =>
		Promise.race(callback.map((fn) => fn(event)));

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been resolved in
 * sequence.
 *
 * @example
 * ```js
 * const getCurrentUser = async (event) => { ... }
 * const checkPermission = async (event) => { ... }
 * const createPost = async (event) => { ... }
 *
 * app.post("/posts", one(getCurrentUser, checkPermission, createPost));
 * ```
 */
export const seq =
	<T extends string>(...callback: RequestCallback<T>[]): RequestCallback<T> =>
	async (event): Promise<void> => {
		for await (const fn of callback) {
			await fn(event);
		}
	};

const resolveListenArgs = (
	port_or_callback_or_undefined?: number | ListenCallback,
	host_or_callback_or_undefined?: string | ListenCallback,
	callback_or_undefined?: ListenCallback
) => {
	const port =
		typeof port_or_callback_or_undefined === "number"
			? port_or_callback_or_undefined
			: undefined;

	const host =
		typeof host_or_callback_or_undefined === "string"
			? host_or_callback_or_undefined
			: undefined;

	const callback =
		callback_or_undefined ||
		(typeof host_or_callback_or_undefined === "string"
			? undefined
			: host_or_callback_or_undefined) ||
		(typeof port_or_callback_or_undefined === "number"
			? undefined
			: port_or_callback_or_undefined);

	return { port, host, callback };
};

const resolveMethodArgs = <T extends string>(
	arg_0: T | RequestCallback<T>,
	...rest: RequestCallback<T>[]
) => {
	const [path, ...callback] =
		typeof arg_0 === "string" ? [arg_0, ...rest] : ["/" as T, arg_0, ...rest];

	return { path, callback };
};

export default (options: Options = {}): Server => {
	const server = createSecureServer(options);

	return {
		close(callback) {
			server.close(
				callback
					? (err?: Error) => {
							try {
								callback(err);
							} catch (err) {
								server.emit("error", err);
							}
					  }
					: undefined
			);
		},
		error(callback) {
			server.on("error", (err?: Error) => {
				try {
					callback(err);
				} catch (err) {
					console.error(err);
				}
			});

			return this;
		},
		listen(...args: any[]) {
			const { port, host, callback } = resolveListenArgs(...args);

			server
				.on("request", async (request, response) => {
					request
						.once("routed", () => {})
						.once("error", (err: Error) => {
							response
								.writeHead(500, "Internal Server Error", {
									"Content-Type": "text/plain; charset=utf-8",
								})
								.end();
						})
						.on("error", (err: Error) => {
							server.emit("error", err);
						});

					const locals: Locals = {};

					for await (const callback of request.listeners("route")) {
						await callback(locals);
					}

					if (response.writableEnded) {
						// do nothing
					} else if (response.headersSent) {
						response.end();
					} else if (request.listenerCount("routed")) {
						response
							.writeHead(405, "Method Not Allowed", {
								"Content-Type": "text/plain; charset=utf-8",
							})
							.end();
					} else {
						response
							.writeHead(404, "Not Found", {
								"Content-Type": "text/plain; charset=utf-8",
							})
							.end();
					}
				})
				.listen(
					{ host, port },
					callback
						? () => {
								try {
									callback({
										address: server.address(),
										listening: server.listening,
									});
								} catch (err) {
									server.emit("error", err);
								}
						  }
						: undefined
				);
		},
		route(path) {
			const { keys: pathKeys, pattern: pathPattern } = parse(path);

			for (const method in METHODS) {
			}
			function match(
				this: Router<typeof path>,
				{
					keys = pathKeys,
					method,
					route = true,
					pattern = pathPattern,
				}: {
					keys?: string[];
					method?: Method;
					route?: boolean;
					pattern?: RegExp;
				},
				...callback: RequestCallback<typeof path>[]
			) {
				server.on("request", (request, response) => {
					if (method && method !== request.method) {
						// No match for method
						return;
					}

					const { authority, scheme, url: target } = request;
					const url = new URL(target, `${scheme}://${authority}`);

					if (pattern.test(url.pathname) === false) {
						// No match for path
						return;
					}

					const params = (pattern.exec(url.pathname) ?? [])
						.slice(1)
						.reduce(
							(p, c, i) => ({ ...p, [keys[i]]: c }),
							{} as RouteParams<typeof path>
						);

					const fn = callback.length === 1 ? callback[0] : seq(...callback);

					request.on("route", async (locals: Locals) => {
						try {
							await fn({ locals, params, request, response, url });
						} catch (err) {
							request.emit("error", err);
						} finally {
							if (route) {
								request.emit("routed");
							}
						}
					});
				});

				return this;
			}

			return {
				all(...callback) {
					return match.call(this, {}, ...callback);
				},
				delete(...callback) {
					return match.call(this, { method: METHODS.DELETE }, ...callback);
				},
				head(...callback) {
					return match.call(this, { method: METHODS.HEAD }, ...callback);
				},
				get(...callback) {
					return match.call(this, { method: METHODS.GET }, ...callback);
				},
				options(...callback) {
					return match.call(this, { method: METHODS.OPTIONS }, ...callback);
				},
				patch(...callback) {
					return match.call(this, { method: METHODS.PATCH }, ...callback);
				},
				post(...callback) {
					return match.call(this, { method: METHODS.POST }, ...callback);
				},
				put(...callback) {
					return match.call(this, { method: METHODS.PUT }, ...callback);
				},
				use(...callback) {
					return match.call(
						this,
						{ ...parse(path, true), route: false },
						...callback
					);
				},
			};
		},
		all(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).all(...callback);
			return this;
		},
		delete(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).all(...callback);
			return this;
		},
		get(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).get(...callback);
			return this;
		},
		head(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).head(...callback);
			return this;
		},
		options(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).options(...callback);
			return this;
		},
		patch(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).patch(...callback);
			return this;
		},
		post(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).post(...callback);
			return this;
		},
		put(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).put(...callback);
			return this;
		},
		use(...args) {
			const { path, callback } = resolveMethodArgs(...args);
			this.route(path).use(...callback);
			return this;
		},
	};
};
