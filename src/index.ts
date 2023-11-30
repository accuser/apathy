import * as bootstrap from "./lib/bootstrap/index.js";
export { all, any, one, seq } from "./lib/helpers/index.js";

export const apathy = <T extends Protocol>(protocol = "http"): Apathy<T> => {
	const apathy = Object.create({ ...bootstrap });

	apathy.handlers = [];

	return apathy;
};

export default apathy;

/**
 * Supported server protocols.
 * @readonly
 * @enum {string}
 */
const PROTOCOLS = {
	/**
	 * HTTP protocol.
	 */
	http: "HTTP",

	/**
	 * HTTP/2 protocol.
	 */
	http2: "HTTP/2",

	/**
	 * HTTPS protocol.
	 */
	https: "HTTPS",
} as const;

/**
 * Type alias for the supported protocols.
 *
 * @see {@link Protocol}
 */
export type Protocol = keyof typeof PROTOCOLS;

/**
 * Apathy: an interface representing a fluent API for building and configuring
 * a web server with route handlers.
 *
 * @template T - type constraint representing the protocol used by the
 * underlying server intance.
 */
export interface Apathy<T extends Protocol> {
	/**
	 * Attach handlers to respond to all HTTP methods at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	all<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	all<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to DELETE requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	delete<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	delete<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to GET requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	get<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	get<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to HEAD requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	head<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	head<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Configure the server to listen for incoming requests on the specified port and host.
	 *
	 * @param {(number | ListenCallback)} port - Port number or callback function.
	 * @param {string} [host] - Host address.
	 * @param {number} [backlog] - Server backlog.
	 * @param {ListenCallback} [callback] - Callback function for when the server starts listening.
	 * @returns {Server<T>} - Instance of the server.
	 */
	listen(callback?: ListenCallback): Server<T>;
	listen(port: number, callback?: ListenCallback): Server<T>;
	listen(port: number, host: string, callback?: ListenCallback): Server<T>;
	listen(
		port: number,
		host: string,
		backlog: number,
		callback?: ListenCallback
	): Server<T>;

	/**
	 * Attach handlers to respond to OPTIONS requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	options<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	options<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to PATCH requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	patch<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	patch<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to POST requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	post<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	post<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Attach handlers to respond to PUT requests at the specified path or globally.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	put<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	put<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;

	/**
	 * Create a nested Apathy instance for a specific path, allowing for hierarchical route handling.
	 *
	 * @param {U} path - Path for which the nested Apathy instance should handle requests.
	 * @returns {Apathy<T>} - Nested Apathy instance for the specified path.
	 */
	route<U extends string>(path: U): Apathy<T>;

	/**
	 * Attach middleware handlers to the server at the global level or for a specific path.
	 *
	 * @param {Handler<T, U>[]} handler - Middleware handlers to be attached.
	 * @returns {Apathy<T>} - Apathy instance for chaining additional configuration.
	 */
	use<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	use<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
}

/**
 * Interface representing a request handler for a web server.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @template U - Type constraint representing the type of the route path.
 */
export interface Handler<T extends Protocol, U extends string> {
	/**
	 * Handles incoming HTTP requests.
	 *
	 * @param {Object} event - Event object containing information about the request.
	 * @param {Locals} event.locals - Local variables for storing request-specific data.
	 * @param {import("regexparam").RouteParams<U>} event.params - Parameters extracted from the route path.
	 * @param {Request<T>} event.request - Incoming request object.
	 * @param {Response<T> & { req: Request<T> }} event.response - Outgoing response object with access to the request.
	 * @param {URL} event.url - Parsed URL object representing the request URL.
	 * @returns {void | Promise<void>} - The handler can perform synchronous or asynchronous operations.
	 */
	(event: {
		locals: Locals;
		params: import("regexparam").RouteParams<U>;
		request: Request<T>;
		response: Response<T> & { req: Request<T> };
		url: URL;
	}): void | Promise<void>;
}

export interface Locals {}

/**
 * Interface representing a callback function invoked when a server starts listening.
 */
export interface ListenCallback {
	/**
	 * Handles the callback when the server starts listening.
	 *
	 * @param {Object} args - Arguments object containing information about the server's listening status.
	 * @param {string | import("node:net").AddressInfo | null} args.address - The address on which the server is listening.
	 * @param {boolean} args.listening - A boolean indicating whether the server is currently listening.
	 * @returns {void} - The callback does not return a value.
	 */
	(args: {
		address: string | import("node:net").AddressInfo | null;
		listening: boolean;
	}): void;
}

/**
 * Interface representing options for configuring server listening.
 */
export interface ListenOptions {
	/**
	 * The port on which the server should listen.
	 * If not provided, an available random port will be chosen.
	 *
	 * @type {number | undefined}
	 */
	port?: number | undefined;

	/**
	 * The host address on which the server should listen.
	 * If not provided, the server will listen on all available network interfaces.
	 *
	 * @type {string | undefined}
	 */
	host?: string | undefined;

	/**
	 * The maximum length of the queue of pending connections.
	 * If not provided, the system default backlog value will be used.
	 *
	 * @type {number | undefined}
	 */
	backlog?: number | undefined;
}

/**
 * Type representing an HTTP request object based on the specified protocol.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @type {T extends "http2" ? import("node:http2").Http2ServerRequest : import("node:http").IncomingMessage}
 */
export type Request<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerRequest
	: import("node:http").IncomingMessage;

/**
 * Type representing an HTTP response object based on the specified protocol.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @type {T extends "http2" ? import("node:http2").Http2ServerResponse : import("node:http").ServerResponse}
 */
export type Response<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerResponse
	: import("node:http").ServerResponse;

/**
 * Interface representing a router for handling routes with specific HTTP methods.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @template U - Type constraint representing the type of the route path.
 */
export interface Router<T extends Protocol, U extends string> {
	/**
	 * Attach handlers to respond to all HTTP methods at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	all(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to DELETE requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	delete(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to GET requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	get(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to HEAD requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	head(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to OPTIONS requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	options(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to PATCH requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	patch(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to POST requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	post(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach handlers to respond to PUT requests at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Route handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	put(...handler: Handler<T, U>[]): Router<T, U>;

	/**
	 * Attach middleware handlers to the router at the specified path.
	 *
	 * @param {Handler<T, U>[]} handler - Middleware handlers to be attached.
	 * @returns {Router<T, U>} - Router instance for chaining additional configuration.
	 */
	use(...handler: Handler<T, U>[]): Router<T, U>;
}

/**
 * Type representing an HTTP server based on the specified protocol.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @type {T extends "http2" ? import("node:http2").Http2SecureServer :
 *        T extends "https" ? import("node:https").Server :
 *        import("node:http").Server}
 */
export type Server<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2SecureServer
	: T extends "https"
	? import("node:https").Server
	: import("node:http").Server;

/**
 * Type representing options for configuring an HTTP server based on the specified protocol.
 *
 * @template T - Type constraint representing the protocol used by the server.
 * @type {T extends "http2" ? import("node:http2").SecureServerOptions :
 *        T extends "https" ? import("node:https").ServerOptions :
 *        import("node:http").ServerOptions}
 */
export type ServerOptions<T extends Protocol> = T extends "http2"
	? import("node:http2").SecureServerOptions
	: T extends "https"
	? import("node:https").ServerOptions
	: import("node:http").ServerOptions;
