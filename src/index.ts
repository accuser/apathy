import { createSecureServer } from "node:http2";
import { parse, type RouteParams } from "regexparam";

export interface Locals {}
export type Options = import("node:http2").SecureServerOptions;
export type Request = import("node:http2").Http2ServerRequest;
export type Response = import("node:http2").Http2ServerResponse;

type Method = "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT";

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

	all<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	delete<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	get<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	head<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	options<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	patch<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	post<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	put<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
	use<T extends string>(path: T, ...callback: RequestCallback<T>[]): Server;
}

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
		listen(
			port_or_callback_or_undefined?: number | ListenCallback,
			host_or_callback_or_undefined?: string | ListenCallback,
			callback_or_undefined?: ListenCallback
		) {
			const port =
				typeof port_or_callback_or_undefined === "number"
					? port_or_callback_or_undefined
					: undefined;
			const host =
				typeof host_or_callback_or_undefined === "string"
					? host_or_callback_or_undefined
					: undefined;
			const callback = callback_or_undefined
				? callback_or_undefined
				: typeof host_or_callback_or_undefined === "string"
				? undefined
				: host_or_callback_or_undefined ??
				  typeof port_or_callback_or_undefined === "number"
				? undefined
				: port_or_callback_or_undefined;

			server
				.on("request", (request, response) => {
					let routed = false;

					request
						.once("routed", () => {
							routed = true;
						})
						.once("error", (err: Error) => {
							response
								.writeHead(500, "Internal Server Error", {
									"Content-Type": "text/plain; charset=utf-8",
								})
								.end();
						})
						.on("error", (err: Error) => {
							server.emit("error", err);
						})
						.emit("route", {} as Locals);

					if (response.writableEnded) {
						// do nothing
					} else if (response.headersSent) {
						response.end();
					} else if (routed) {
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
			const { keys, pattern } = parse(path);

			function match(
				method: Method,
				...callback: RequestCallback<typeof path>[]
			) {
				server.on("request", (request, response) => {
					const { authority, scheme, url: target } = request;
					const url = new URL(target, `${scheme}://${authority}`);

					if (pattern.test(url.pathname)) {
						const params = (pattern.exec(url.pathname) ?? [])
							.slice(1)
							.reduce(
								(p, c, i) => ({ ...p, [keys[i]]: c }),
								{} as RouteParams<typeof path>
							);

						callback.forEach((fn) => {
							request.on(
								"route",
								method === request.method
									? (locals: Locals) => {
											try {
												fn({ locals, params, request, response, url });
											} catch (err) {
												request.emit("error", err);
											} finally {
												request.emit("routed");
											}
									  }
									: () => {
											request.emit("routed");
									  }
							);
						});
					}
				});
			}

			return {
				all(...callback) {
					server.on("request", (request, response) => {
						const { authority, scheme, url: target } = request;
						const url = new URL(target, `${scheme}://${authority}`);

						if (pattern.test(url.pathname)) {
							const params = (pattern.exec(url.pathname) ?? [])
								.slice(1)
								.reduce(
									(p, c, i) => ({ ...p, [keys[i]]: c }),
									{} as RouteParams<typeof path>
								);

							callback.forEach((fn) => {
								request.on("route", (locals: Locals) => {
									try {
										fn({ locals, params, request, response, url });
									} catch (err) {
										request.emit("error", err);
									} finally {
										request.emit("routed");
									}
								});
							});
						}
					});

					return this;
				},
				delete(...callback) {
					match("DELETE", ...callback);
					return this;
				},
				head(...callback) {
					match("HEAD", ...callback);
					return this;
				},
				get(...callback) {
					match("GET", ...callback);
					return this;
				},
				options(...callback) {
					match("OPTIONS", ...callback);
					return this;
				},
				patch(...callback) {
					match("PATCH", ...callback);
					return this;
				},
				post(...callback) {
					match("POST", ...callback);
					return this;
				},
				put(...callback) {
					match("PUT", ...callback);
					return this;
				},
				use(...callback) {
					server.on("request", (request, response) => {
						const { authority, scheme, url: target } = request;

						const url = new URL(target, `${scheme}://${authority}`);

						if (url.pathname.startsWith(path)) {
							const params = (pattern.exec(url.pathname) ?? [])
								.slice(1)
								.reduce(
									(p, c, i) => ({ ...p, [keys[i]]: c }),
									{} as RouteParams<typeof path>
								);

							callback.forEach((fn) => {
								request.on("route", (locals: Locals) => {
									try {
										fn({ locals, params, request, response, url });
									} catch (err) {
										request.emit("error", err);
									}
								});
							});
						}
					});

					return this;
				},
			};
		},
		all(path, ...callback) {
			this.route(path).all(...callback);
			return this;
		},
		delete(path, ...callback) {
			this.route(path).delete(...callback);
			return this;
		},
		get(path, ...callback) {
			this.route(path).get(...callback);
			return this;
		},
		head(path, ...callback) {
			this.route(path).head(...callback);
			return this;
		},
		options(path, ...callback) {
			this.route(path).options(...callback);
			return this;
		},
		patch(path, ...callback) {
			this.route(path).patch(...callback);
			return this;
		},
		post(path, ...callback) {
			this.route(path).post(...callback);
			return this;
		},
		put(path, ...callback) {
			this.route(path).put(...callback);
			return this;
		},
		use(path, ...callback) {
			this.route(path).use(...callback);
			return this;
		},
	};
};
