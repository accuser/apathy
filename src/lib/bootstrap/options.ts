import type { Apathy, Handler } from "../../index.js";

const resolveArgs = <T extends string>(
	arg_0: T | Handler<T>,
	...args: Handler<T>[]
) => {
	const path = typeof arg_0 === "string" ? arg_0 : ("/" as T);
	const handler = typeof arg_0 === "string" ? args : [arg_0, ...args];

	return { handler, path };
};

export default function <T extends string>(
	this: Apathy,
	arg_0: T | Handler<T>,
	...args: Handler<T>[]
) {
	const { handler, path } = resolveArgs(arg_0, ...args);

	this.route(path).options(...handler);

	return this;
}
