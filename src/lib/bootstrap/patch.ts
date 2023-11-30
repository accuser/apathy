import type { Apathy, Handler } from "../../index.js";

export default function <T extends string>(
	this: Apathy,
	arg_0: T | Handler<T>,
	...args: Handler<T>[]
) {
	const path = typeof arg_0 === "string" ? arg_0 : ("/" as T);
	const handler = typeof arg_0 === "string" ? args : [arg_0, ...args];

	this.route(path).patch(...handler);

	return this;
}
