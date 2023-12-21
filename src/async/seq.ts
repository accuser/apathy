import { Router } from "../router.js";
import { Server } from "../server.js";

/**
 * Combines multiple {@link Handler} functions into a single function
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
export default <P extends Server.Protocol>(
		...handler: Router.Handler<P>[]
	): Router.Handler<P> =>
	async (event) => {
		for await (const fn of handler) {
			await fn(event);
		}
	};
