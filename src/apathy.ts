import router, { Router } from "./router.js";
import server, { type Server } from "./server.js";

/**
 * Apathy is a library for building performant RESTful APIs, particularly for microservices.
 *
 * @interface Apathy
 * @extends {Router<P>}
 * @extends {Server<P>}
 * @template P extends Protocol
 */
export interface Apathy<P extends Server.Protocol>
	extends Router<P>,
		Server<P> {
	/**
	 * Registers a handler for all HTTP methods for a given path.
	 *
	 * @param {string} path - The path on which the handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) to execute when the path is accessed.
	 * @returns {this}
	 */
	all(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a DELETE request handler for a given path.
	 *
	 * @param {string} path - The path on which the DELETE request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for DELETE requests.
	 * @returns {this}
	 */
	delete(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a GET request handler for a given path.
	 *
	 * @param {string} path - The path on which the GET request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for GET requests.
	 * @returns {this}
	 */
	get(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a HEAD request handler for a given path.
	 *
	 * @param {string} path - The path on which the HEAD request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for HEAD requests.
	 * @returns {this}
	 */
	head(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers an OPTIONS request handler for a given path.
	 *
	 * @param {string} path - The path on which the OPTIONS request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for OPTIONS requests.
	 * @returns {this}
	 */
	options(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a PATCH request handler for a given path.
	 *
	 * @param {string} path - The path on which the PATCH request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for PATCH requests.
	 * @returns {this}
	 */
	patch(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a POST request handler for a given path.
	 *
	 * @param {string} path - The path on which the POST request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for POST requests.
	 * @returns {this}
	 */
	post(path: string, ...handler: Router.Handler<P>[]): this;

	/**
	 * Registers a PUT request handler for a given path.
	 *
	 * @param {string} path - The path on which the PUT request handler will be registered.
	 * @param {...Router.Handler<P>} handler - The handler function(s) for PUT requests.
	 * @returns {this}
	 */
	put(path: string, ...handler: Router.Handler<P>[]): this;
}

/**
 * Creates a new Apathy instance with specified protocol and options.
 *
 * @template P extends Server.Protocol
 * @param {P} [protocol="http"] - The protocol to be used by the server. Defaults to HTTP.
 * @param {Server.Options<P>} [options={}] - Configuration options for the server.
 * @returns {Apathy<P>} A new instance of Apathy with the specified protocol and options.
 *
 * @example
 * // Creating a default Apathy instance with HTTP protocol
 * const api = Apathy();
 *
 * @example
 * // Creating an Apathy instance with HTTPS protocol and custom options
 * const api = Apathy('https', { ssl: { key: '...', cert: '...' } });
 */
export default <P extends Server.Protocol>(
	protocol = "http" as P,
	options = {} as Server.Options<P>
): Apathy<P> =>
	Object.assign(router(), server(protocol, options), buildApathy());

/**
 * @private
 * @param methods - collection of methods to include
 * @returns
 */
const buildApathy = <P extends Server.Protocol>(methods = Router.METHODS) =>
	Object.entries(methods).reduce(
		(p, [key, value]) =>
			Object.assign(p, {
				[key.toLowerCase()]: function (
					this: Apathy<P>,
					path: string,
					...handler: Router.Handler<P>[]
				) {
					return this.on(value as Router.Method, path, ...handler);
				},
			}),
		buildOn()
	);

const buildOn = <P extends Server.Protocol>() =>
	Object.assign({
		all: function (
			this: Apathy<P>,
			path: string,
			...handler: Router.Handler<P>[]
		) {
			return this.on(path, ...handler);
		},
	});
