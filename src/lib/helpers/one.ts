import { Handler, Protocol } from "../../index.js";

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
export default <T extends Protocol, U extends string>(
		...callback: Handler<T, U>[]
	): Handler<T, U> =>
	(event) =>
		Promise.race(callback.map((fn) => fn(event))).then(void 0);
