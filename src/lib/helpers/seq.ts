import { Handler, Protocol } from "../../index.js";

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
export default <T extends Protocol, U extends string>(
		...callback: Handler<T, U>[]
	): Handler<T, U> =>
	async (event) => {
		for await (const fn of callback) {
			await fn(event);
		}
	};
