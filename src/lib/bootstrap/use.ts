import { Apathy, Handler, Protocol } from "../../index.js";

const resolveArgs = <T extends Protocol, U extends string>(
	arg_0: T | Handler<T, U>,
	...args: Handler<T, U>[]
) => {
	const path = typeof arg_0 === "string" ? arg_0 : ("/" as U);
	const handler = typeof arg_0 === "string" ? args : [arg_0, ...args];

	return { handler, path };
};

export default function <T extends Protocol, U extends string>(
	this: Apathy<T>,
	arg_0: T | Handler<T, U>,
	...args: Handler<T, U>[]
) {
	const { handler, path } = resolveArgs(arg_0, ...args);

	this.route(path).use(...handler);

	return this;
}
