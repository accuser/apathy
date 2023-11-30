import { Handler, Protocol } from "../../index.js";

/**
 * Combines multiple {@link Handler} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been resolved.
 */
export default <T extends Protocol, U extends string>(
		...callback: Handler<T, U>[]
	): Handler<T, U> =>
	(event) =>
		Promise.all(callback.map((fn) => fn(event))).then(() => void 0);
