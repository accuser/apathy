import { createServer as createHttpServer } from "node:http";
import { createSecureServer as createHttp2Server } from "node:http2";
import { createServer as createHttpsServer } from "node:https";
import { parse, type RouteParams } from "regexparam";

export interface Locals {}

const PROTOCOLS = {
	http: "HTTP",
	http2: "HTTP/2",
	https: "HTTPS",
} as const;

type Protocol = keyof typeof PROTOCOLS;

type Options<T extends Protocol> = T extends "http"
	? import("node:http").ServerOptions
	: T extends "http2"
	? import("node:http2").SecureServerOptions
	: import("https").ServerOptions;

type Request<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerRequest
	: import("node:http").IncomingMessage;

type Response<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerResponse
	: import("node:http").ServerResponse;

type Server<T extends Protocol> = T extends "http"
	? import("node:http").Server
	: T extends "http2"
	? import("node:http2").Http2SecureServer
	: import("https").Server;

export type RequestCallback<T extends Protocol, P extends string> = (event: {
	locals: Locals;
	params: RouteParams<P>;
	request: Request<T>;
	response: Response<T>;
	url: URL;
}) => void;

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

interface Router<T extends Protocol, P extends string> {
	all(...callback: RequestCallback<T, P>[]): Router<T, P>;
	delete(...callback: RequestCallback<T, P>[]): Router<T, P>;
	get(...callback: RequestCallback<T, P>[]): Router<T, P>;
	head(...callback: RequestCallback<T, P>[]): Router<T, P>;
	options(...callback: RequestCallback<T, P>[]): Router<T, P>;
	patch(...callback: RequestCallback<T, P>[]): Router<T, P>;
	post(...callback: RequestCallback<T, P>[]): Router<T, P>;
	put(...callback: RequestCallback<T, P>[]): Router<T, P>;
	use(...callback: RequestCallback<T, P>[]): Router<T, P>;
}

interface Apathy<T extends Protocol> {
	close(callback?: ErrorCallback): void;

	error(callback: ErrorCallback): Apathy<T>;

	listen(callback?: ListenCallback): void;
	listen(port: number, callback?: ListenCallback): void;
	listen(port: number, host: string, callback?: ListenCallback): void;

	route<P extends string>(path: P): Router<T, P>;

	all<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	all<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	delete<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	delete<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP GET requests for the default path.
	 */
	get<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	get<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP HEAD requests for the default path.
	 */
	head<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	head<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP OPTIONS requests for the default path.
	 */
	options<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	options<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP PATCH requests for the default path.
	 */
	patch<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	patch<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP POST requests for the default path.
	 */
	post<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	post<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	/**
	 * Registers a callback to handle HTTP PUT requests for the default path.
	 */
	put<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	put<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;

	use<P extends string>(...callback: RequestCallback<T, P>[]): Apathy<T>;
	use<P extends string>(
		path: P,
		...callback: RequestCallback<T, P>[]
	): Apathy<T>;
}

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been resolved.
 */
export const all =
	<T extends Protocol, P extends string>(
		...callback: RequestCallback<T, P>[]
	): RequestCallback<T, P> =>
	(event) =>
		Promise.all(callback.map((fn) => fn(event)));

/**
 * Combines multiple {@link RequestCallback} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been settled.
 */
export const any =
	<T extends Protocol, P extends string>(
		...callback: RequestCallback<T, P>[]
	): RequestCallback<T, P> =>
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
	<T extends Protocol, P extends string>(
		...callback: RequestCallback<T, P>[]
	): RequestCallback<T, P> =>
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
	<T extends Protocol, P extends string>(
		...callback: RequestCallback<T, P>[]
	): RequestCallback<T, P> =>
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

const resolveMethodArgs = <T extends Protocol, P extends string>(
	arg_0: P | RequestCallback<T, P>,
	...rest: RequestCallback<T, P>[]
) => {
	const [path, ...callback] =
		typeof arg_0 === "string" ? [arg_0, ...rest] : ["/" as P, arg_0, ...rest];

	return { path, callback };
};

export default <T extends Protocol>(
	protocol: T,
	options: Options<T> = {} as Options<T>
): Apathy<T> => {
	const server =
		protocol === "http"
			? createHttpServer(options)
			: protocol === "http2"
			? createHttp2Server(options)
			: createHttpsServer(options);

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
			server.on("error", (err: Error) => {
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

			if (server.listenerCount("error") === 0) {
				server.on("error", (err: Error) => {
					console.error("[Apathy] unhandled error", err);
				});
			}

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

			function match(
				this: Router<T, typeof path>,
				{
					callback,
					keys = pathKeys,
					method,
					route = true,
					pattern = pathPattern,
				}: {
					callback: RequestCallback<T, typeof path>[];
					keys?: string[];
					method?: Method;
					route?: boolean;
					pattern?: RegExp;
				}
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
					return match.call(this, { callback });
				},
				delete(...callback) {
					return match.call(this, { callback, method: METHODS.DELETE });
				},
				head(...callback) {
					return match.call(this, { callback, method: METHODS.HEAD });
				},
				get(...callback) {
					return match.call(this, { callback, method: METHODS.GET });
				},
				options(...callback) {
					return match.call(this, { callback, method: METHODS.OPTIONS });
				},
				patch(...callback) {
					return match.call(this, { callback, method: METHODS.PATCH });
				},
				post(...callback) {
					return match.call(this, { callback, method: METHODS.POST });
				},
				put(...callback) {
					return match.call(this, { callback, method: METHODS.PUT });
				},
				use(...callback) {
					return match.call(this, {
						...parse(path, true),
						callback,
						route: false,
					});
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
