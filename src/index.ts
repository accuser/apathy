import * as bootstrap from "./lib/bootstrap/index.js";
export { all, any, one, seq } from "./lib/helpers/index.js";

export const apathy = <T extends Protocol>(protocol = "http"): Apathy<T> => {
	const apathy = Object.create({ ...bootstrap });

	apathy.handlers = [];

	return apathy;
};

export default apathy;

const PROTOCOLS = {
	http: "HTTP",
	http2: "HTTP/2",
	https: "HTTPS",
} as const;

export type Protocol = keyof typeof PROTOCOLS;

export interface Apathy<T extends Protocol> {
	all<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	all<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	delete<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	delete<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	get<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	get<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	head<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	head<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	listen(callback?: ListenCallback): Server<T>;
	listen(port: number, callback?: ListenCallback): Server<T>;
	listen(port: number, host: string, callback?: ListenCallback): Server<T>;
	listen(
		port: number,
		host: string,
		backlog: number,
		callback?: ListenCallback
	): Server<T>;
	options<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	options<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	patch<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	patch<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	post<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	post<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	put<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	put<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
	route<U extends string>(path: U): Apathy<T>;
	use<U extends string>(...handler: Handler<T, U>[]): Apathy<T>;
	use<U extends string>(path: U, ...handler: Handler<T, U>[]): Apathy<T>;
}

export interface Handler<T extends Protocol, U extends string> {
	(event: {
		locals: Locals;
		params: import("regexparam").RouteParams<U>;
		request: Request<T>;
		response: Response<T> & { req: Request<T> };
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

export type Request<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerRequest
	: import("node:http").IncomingMessage;
export type Response<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2ServerResponse
	: import("node:http").ServerResponse;

export interface Router<T extends Protocol, U extends string> {
	all(...handler: Handler<T, U>[]): Router<T, U>;
	delete(...handler: Handler<T, U>[]): Router<T, U>;
	get(...handler: Handler<T, U>[]): Router<T, U>;
	head(...handler: Handler<T, U>[]): Router<T, U>;
	options(...handler: Handler<T, U>[]): Router<T, U>;
	patch(...handler: Handler<T, U>[]): Router<T, U>;
	post(...handler: Handler<T, U>[]): Router<T, U>;
	put(...handler: Handler<T, U>[]): Router<T, U>;
	use(...handler: Handler<T, U>[]): Router<T, U>;
}

export type Server<T extends Protocol> = T extends "http2"
	? import("node:http2").Http2SecureServer
	: T extends "https"
	? import("node:https").Server
	: import("node:http").Server;

export type ServerOptions<T extends Protocol> = T extends "http2"
	? import("node:http2").SecureServerOptions
	: T extends "https"
	? import("node:https").ServerOptions
	: import("node:http").ServerOptions;
