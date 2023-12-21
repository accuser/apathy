import { Router } from "../router.js";
import { Server } from "../server.js";

/**
 * Combines multiple {@link Router.Handler} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been resolved.
 */
export default <P extends Server.Protocol>(
		...handler: Router.Handler<P>[]
	): Router.Handler<P> =>
	(event) =>
		Promise.all(handler.map((fn) => fn(event))).then(void 0);
