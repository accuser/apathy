import * as bootstrap from "./lib/bootstrap/index.js";

export default (): Apathy => {
	const apathy = Object.create({ ...bootstrap });

	apathy.handlers = [];

	return apathy;
};

export interface Apathy {
	all<T extends string>(...handler: Handler<T>[]): Apathy;
	all<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	delete<T extends string>(...handler: Handler<T>[]): Apathy;
	delete<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	get<T extends string>(...handler: Handler<T>[]): Apathy;
	get<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	head<T extends string>(...handler: Handler<T>[]): Apathy;
	head<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	listen(callback?: ListenCallback): import("node:http").Server;
	listen(port: number, callback?: ListenCallback): import("node:http").Server;
	listen(
		port: number,
		host: string,
		callback?: ListenCallback
	): import("node:http").Server;
	listen(
		port: number,
		host: string,
		backlog: number,
		callback?: ListenCallback
	): import("node:http").Server;
	options<T extends string>(...handler: Handler<T>[]): Apathy;
	options<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	patch<T extends string>(...handler: Handler<T>[]): Apathy;
	patch<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	post<T extends string>(...handler: Handler<T>[]): Apathy;
	post<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	put<T extends string>(...handler: Handler<T>[]): Apathy;
	put<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
	route<T extends string>(path: T): Apathy;
	use<T extends string>(...handler: Handler<T>[]): Apathy;
	use<T extends string>(path: T, ...handler: Handler<T>[]): Apathy;
}

export interface Handler<
	T extends string,
	Request extends import("node:http").IncomingMessage = import("node:http").IncomingMessage,
	Response extends import("node:http").ServerResponse = import("node:http").ServerResponse
> {
	(event: {
		locals: Locals;
		params: import("regexparam").RouteParams<T>;
		request: Request;
		response: Response & { req: Request };
		url: URL;
	}): void | Promise<void>;
}

export interface Locals {}

export interface ListenCallback {
	(args: {
		address: string | import("node:net").AddressInfo | null;
		listening: boolean;
	}): void;
}

export interface ListenOptions {
	port?: number | undefined;
	host?: string | undefined;
	backlog?: number | undefined;
}

export interface Router<T extends string> {
	all(...handler: Handler<T>[]): Router<T>;
	delete(...handler: Handler<T>[]): Router<T>;
	get(...handler: Handler<T>[]): Router<T>;
	head(...handler: Handler<T>[]): Router<T>;
	options(...handler: Handler<T>[]): Router<T>;
	patch(...handler: Handler<T>[]): Router<T>;
	post(...handler: Handler<T>[]): Router<T>;
	put(...handler: Handler<T>[]): Router<T>;
	use(...handler: Handler<T>[]): Router<T>;
}
