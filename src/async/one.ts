import { Router } from "../router.js";
import { Server } from "../server.js";

/**
 * Combines multiple {@link Handler} functions into a single function
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
export default <P extends Server.Protocol>(
		...handler: Router.Handler<P>[]
	): Router.Handler<P> =>
	(event) =>
		Promise.race(handler.map((fn) => fn(event))).then(void 0);
