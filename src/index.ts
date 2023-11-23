import {
	createSecureServer,
	type Http2ServerRequest,
	type Http2ServerResponse,
	type SecureServerOptions,
} from "node:http2";
import { AddressInfo } from "node:net";
import { parse } from "regexparam";

type Method = "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT";

type ListenCallback = (args: {
	address: string | AddressInfo | null;
	listening: boolean;
}) => void;

type RequestCallback = (
	request: Http2ServerRequest,
	response: Http2ServerResponse
) => void;

interface ListenOptions {
	port?: number;
	host?: string;
}

interface Router {
	match(method: Method, callback: RequestCallback): Router;

	all(callback: RequestCallback): Router;
	delete(callback: RequestCallback): Router;
	get(callback: RequestCallback): Router;
	head(callback: RequestCallback): Router;
	options(callback: RequestCallback): Router;
	patch(callback: RequestCallback): Router;
	post(callback: RequestCallback): Router;
	put(callback: RequestCallback): Router;
	use(callback: RequestCallback): Router;
}

interface Server {
	/**
	 * Stops the server from accepting new connections and keeps existing
	 * connections.
	 */
	close(callback?: (err?: Error) => void): Server;

	error(callback: (err?: Error) => void): Server;

	/**
	 * Start a server listening for connections.
	 */
	listen(callback?: ListenCallback): Server;
	listen(port: number, callback?: ListenCallback): Server;
	listen(port: number, host: string, callback?: ListenCallback): Server;

	match(method: Method, callback: RequestCallback): Server;
	match(method: Method, path: string, callback: RequestCallback): Server;

	route(path: string): Router;

	all(callback: RequestCallback): Server;
	all(path: string, callback: RequestCallback): Server;

	delete(callback: RequestCallback): Server;
	delete(path: string, callback: RequestCallback): Server;

	get(callback: RequestCallback): Server;
	get(path: string, callback: RequestCallback): Server;

	head(callback: RequestCallback): Server;
	head(path: string, callback: RequestCallback): Server;

	options(callback: RequestCallback): Server;
	options(path: string, callback: RequestCallback): Server;

	patch(callback: RequestCallback): Server;
	patch(path: string, callback: RequestCallback): Server;

	post(callback: RequestCallback): Server;
	post(path: string, callback: RequestCallback): Server;

	put(callback: RequestCallback): Server;
	put(path: string, callback: RequestCallback): Server;

	use(callback: RequestCallback): Server;
	use(path: string, callback: RequestCallback): Server;
}

export default (options: SecureServerOptions = {}): Server => {
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

			return this;
		},
		error(callback) {
			server.on("error", (err?: Error) => {
				try {
					callback(err);
				} catch (err) {
					console.error(err);
				}
			});
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
			const callback =
				callback_or_undefined ??
				typeof host_or_callback_or_undefined === "string"
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
						.on("error", (err: Error) => {
							response.writeHead(500, "Internal Server Error", {
								"Content-Type": "text/plain; charset=utf-8",
							});
						})
						.on("error", (err: Error) => {
							server.emit("error", err);
						})
						.emit("route");

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

			return this;
		},
		match(
			method: Method,
			path_or_callback: string | RequestCallback,
			callback_or_undefined?: RequestCallback
		) {
			const path =
				typeof path_or_callback === "string" ? path_or_callback : "/";
			const callback =
				typeof path_or_callback === "string"
					? (callback_or_undefined as RequestCallback)
					: path_or_callback;

			this.route(path).match(method, callback);

			return this;
		},
		route(path) {
			return {
				match(method: Method, callback: RequestCallback) {
					const { keys, pattern } = parse(path);

					server.on("request", (request, response) => {
						const { authority, scheme, url } = request;
						const { pathname } = new URL(url, `${scheme}://${authority}`);

						if (pattern.test(pathname)) {
							request.on("route", () => {
								try {
									if (method === request.method) {
										callback(request, response);
									}
								} catch (err) {
									request.emit("error", err);
								} finally {
									request.emit("routed");
								}
							});
						}
					});

					return this;
				},
				all(callback) {
					const { keys, pattern } = parse(path);

					server.on("request", (request, response) => {
						const { authority, scheme, url } = request;
						const { pathname } = new URL(url, `${scheme}://${authority}`);

						if (pattern.test(pathname)) {
							request.on("route", () => {
								try {
									callback(request, response);
								} catch (err) {
									request.emit("error", err);
								} finally {
									request.emit("routed");
								}
							});
						}
					});

					return this;
				},
				delete(callback) {
					return this.match("DELETE", callback);
				},
				head(callback) {
					return this.match("HEAD", callback);
				},
				get(callback) {
					return this.match("GET", callback);
				},
				options(callback) {
					return this.match("OPTIONS", callback);
				},
				patch(callback) {
					return this.match("PATCH", callback);
				},
				post(callback) {
					return this.match("POST", callback);
				},
				put(callback) {
					return this.match("PUT", callback);
				},
				use(callback) {
					server.on("request", (request, response) => {
						const { authority, scheme, url } = request;
						const { pathname } = new URL(url, `${scheme}://${authority}`);

						if (pathname.startsWith(path)) {
							request.on("route", () => {
								try {
									callback(request, response);
								} catch (err) {
									request.emit("error", err);
								}
							});
						}
					});

					return this;
				},
			};
		},
		all(
			path_or_callback: string | RequestCallback,
			callback_or_undefined?: RequestCallback
		) {
			const path =
				typeof path_or_callback === "string" ? path_or_callback : "/";
			const callback =
				typeof path_or_callback === "string"
					? (callback_or_undefined as RequestCallback)
					: path_or_callback;

			this.route(path).all(callback);

			return this;
		},
		delete(path, callback) {
			return this.match("DELETE", path, callback);
		},
		get(path, callback) {
			return this.match("GET", path, callback);
		},
		head(path, callback) {
			return this.match("HEAD", path, callback);
		},
		options(path, callback) {
			return this.match("OPTIONS", path, callback);
		},
		patch(path, callback) {
			return this.match("PATCH", path, callback);
		},
		post(path, callback) {
			return this.match("POST", path, callback);
		},
		put(path, callback) {
			return this.match("PUT", path, callback);
		},
		use(
			path_or_callback: string | RequestCallback,
			callback_or_undefined?: RequestCallback
		) {
			const path =
				typeof path_or_callback === "string" ? path_or_callback : "/";
			const callback =
				typeof path_or_callback === "string"
					? (callback_or_undefined as RequestCallback)
					: path_or_callback;

			this.route(path).use(callback);

			return this;
		},
	} as Server;
};
