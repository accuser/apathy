import { Handler } from "../../index.js";

/**
 * Combines multiple {@link Handler} functions into a single function
 * that invokes all the provided callbacks concurrently and returns a
 * {@link Promise} that resolves when all the callbacks have been settled.
 */
export default <T extends string>(...callback: Handler<T>[]): Handler<T> =>
	(event) =>
		Promise.allSettled(callback.map((fn) => fn(event)))
			.then(() => void 0)
			.catch(() => void 0);
