import { Abortable } from "node:events";
import { createServer as createHttpServer } from "node:http";
import { createSecureServer as createHttp2SecureServer } from "node:http2";
import { createServer as createHttpsServer } from "node:https";
import { pid } from "node:process";
import { DEFAULT_HOST, DEFAULT_PORT } from "./env.js";

/**
 * Supported server protocols.
 */
const PROTOCOLS = {
	http: "http",
	http2: "http2",
	https: "https",
} as const;

/**
 * Represents a generic server interface that can handle different protocols.
 *
 * This interface extends the `Server.RequestListener<P>`, which means it
 * can process incoming requests for the specific protocol.
 *
 * The `Server` interface provides several overloaded versions of the `listen`
 * method, allowing the server to start listening for incoming connections
 * on a specified port, optionally with a hostname and a backlog limit.
 *
 * @template P - The type of the protocol that the server will handle. Must
 *               be a type that extends from `Server.Protocol`.
 */
export interface Server<P extends Server.Protocol>
	extends Server.RequestListener<P> {
	/**
	 * Starts the server listening for connections.
	 *
	 * @param listeningListener - An optional callback function that is called
	 *                            when the server starts listening.
	 * @returns This server instance for chaining.
	 */
	listen(listeningListener?: Server.ListenCallback | { (): void }): this;

	/**
	 * Starts the server listening for connections on a specified port.
	 *
	 * @param port - The port number on which the server should listen.
	 * @param listeningListener - An optional callback function that is called
	 *                            when the server starts listening.
	 * @returns This server instance for chaining.
	 */
	listen(
		port?: number,
		listeningListener?: Server.ListenCallback | { (): void }
	): this;

	/**
	 * Starts the server listening for connections on a specified port with a backlog limit.
	 *
	 * @param port - The port number on which the server should listen.
	 * @param backlog - The maximum number of queued pending connections.
	 * @param listeningListener - An optional callback function that is called
	 *                            when the server starts listening.
	 * @returns This server instance for chaining.
	 */
	listen(
		port?: number,
		backlog?: number,
		listeningListener?: Server.ListenCallback | { (): void }
	): this;

	/**
	 * Starts the server listening for connections on a specified port and hostname.
	 *
	 * @param port - The port number on which the server should listen.
	 * @param hostname - The hostname on which the server should listen.
	 * @param listeningListener - An optional callback function that is called
	 *                            when the server starts listening.
	 * @returns This server instance for chaining.
	 */
	listen(
		port?: number,
		hostname?: string,
		listeningListener?: Server.ListenCallback | { (): void }
	): this;

	/**
	 * Starts the server listening for connections on a specified port, with a hostname and a backlog limit.
	 *
	 * @param port - The port number on which the server should listen.
	 * @param hostname - The hostname on which the server should listen.
	 * @param backlog - The maximum number of queued pending connections.
	 * @param listeningListener - An optional callback function that is called
	 *                            when the server starts listening.
	 * @returns This server instance for chaining.
	 */
	listen(
		port?: number,
		hostname?: string,
		backlog?: number,
		listeningListener?: Server.ListenCallback | { (): void }
	): this;
}

export default <P extends Server.Protocol>(
	protocol: P,
	options: Server.Options<P>
): Server<P> => Object.assign({ listen: buildListen(protocol, options) });

export namespace Server {
	export type Protocol = keyof typeof PROTOCOLS;

	export type RequestListener<P extends Protocol> = (
		req: Request<P>,
		res: Response<P>
	) => void;

	export type Request<P extends Protocol> = P extends "http2"
		? import("node:http2").Http2ServerRequest
		: P extends "http" | "https"
		? import("node:http").IncomingMessage
		: never;

	export type Response<P extends Protocol> = P extends "http2"
		? import("node:http2").Http2ServerResponse
		: P extends "http" | "https"
		? import("node:http").ServerResponse
		: never;

	export type Options<P extends Protocol> = P extends "http2"
		? import("node:http2").SecureServerOptions
		: P extends "https"
		? import("node:https").ServerOptions
		: P extends "http"
		? import("node:http").ServerOptions
		: never;

	export interface ListenCallback {
		(args: {
			address: string | import("node:net").AddressInfo | null;
			listening: boolean;
			pid: number;
		}): void;
	}

	export interface ListenOptions extends Abortable {
		port?: number | undefined;
		host?: string | undefined;
		backlog?: number | undefined;
		path?: string | undefined;
		exclusive?: boolean | undefined;
		readableAll?: boolean | undefined;
		writableAll?: boolean | undefined;
		/**
		 * @default false
		 */
		ipv6Only?: boolean | undefined;
	}
}

const resolveListenArgs = (
	arg_0?: number | Server.ListenCallback | Server.ListenOptions,
	arg_1?: string | Server.ListenCallback,
	arg_2?: number | Server.ListenCallback,
	arg_3?: Server.ListenCallback
) => {
	const port = typeof arg_0 === "number" ? arg_0 : DEFAULT_PORT;
	const host = typeof arg_1 === "string" ? arg_1 : DEFAULT_HOST;
	const backlog =
		typeof arg_2 === "number"
			? arg_2
			: typeof arg_1 === "number"
			? arg_1
			: undefined;

	const callback =
		arg_3 ||
		(typeof arg_2 === "function" ? arg_2 : undefined) ||
		(typeof arg_1 === "function" ? arg_1 : undefined) ||
		(typeof arg_0 === "function" ? arg_0 : undefined);

	const options =
		(typeof arg_0 === "number"
			? undefined
			: typeof arg_0 === "function"
			? undefined
			: arg_0) || ({ backlog, host, port } as Server.ListenOptions);

	return { callback, options };
};

const buildListen = <P extends Server.Protocol>(
	protocol: P,
	options: Server.Options<P>
) =>
	function listen(
		this: Server<P>,
		...args: Parameters<typeof resolveListenArgs>
	) {
		const server = createServer(protocol, options, this);

		if (server) {
			const { callback, options } = resolveListenArgs(...args);

			server.listen(
				options,
				callback
					? () =>
							callback({
								address: server.address(),
								listening: server.listening,
								pid,
							})
					: undefined
			);
		}

		return server;
	};

const createServer = <P extends Server.Protocol>(
	protocol: P,
	options: Server.Options<P>,
	onRequestHandler: Server.RequestListener<P>
) =>
	protocol === "http2"
		? createHttp2SecureServer(
				options,
				onRequestHandler as Server.RequestListener<"http2">
		  )
		: protocol === "https"
		? createHttpsServer(
				options,
				onRequestHandler as Server.RequestListener<"https">
		  )
		: protocol === "http"
		? createHttpServer(
				options,
				onRequestHandler as Server.RequestListener<"http">
		  )
		: undefined;
