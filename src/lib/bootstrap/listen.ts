import { createServer } from "http";
import type {
	Apathy,
	ListenCallback,
	ListenOptions,
	Protocol,
} from "../../index.js";
const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 3000;

const resolveArgs = (
	arg_0?: number | ListenCallback | ListenOptions,
	arg_1?: string | ListenCallback,
	arg_2?: number | ListenCallback,
	arg_3?: ListenCallback
) => {
	const port = typeof arg_0 === "number" ? arg_0 : DEFAULT_PORT;
	const host = typeof arg_1 === "string" ? arg_1 : DEFAULT_HOST;
	const backlog = typeof arg_2 === "number" ? arg_2 : undefined;

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
			: arg_0) || ({ backlog, host, port } as ListenOptions);

	return { callback, options };
};

const urlFrom = (request: {
	headers: import("node:http").IncomingHttpHeaders;
	url?: string;
}) => {
	const {
		headers: { ":authority": authority, ":scheme": scheme = "http", host },
		url = "/",
	} = request;

	return new URL(url, `${scheme}://${authority ?? host}`);
};

export default function <T extends Protocol>(this: Apathy<T>, ...args: any[]) {
	const { callback, options } = resolveArgs(...args);

	const server = createServer(async (request, response) => {
		const event = {
			locals: {},
			params: {},
			request,
			response,
			url: urlFrom(request),
		};

		for (const handler of (this as unknown as { handlers: Function[] })
			.handlers) {
			await handler(event);
		}

		if (response.writableEnded) {
			// do nothing
		} else if (response.headersSent) {
			response.end();
			// } else if (routed) {
			// 	response
			// 		.writeHead(405, "Method Not Allowed", {
			// 			"Content-Type": "text/plain; charset=utf-8",
			// 		})
			// 		.end();
		} else {
			response
				.writeHead(404, "Not Found", {
					"Content-Type": "text/plain; charset=utf-8",
				})
				.end();
		}
	}).listen(
		options,
		callback
			? () => {
					try {
						callback({
							address: server.address(),
							listening: server.listening,
						});
					} catch (err) {
						server.emit("error", err);
					}
			  }
			: undefined
	);
}
// 		if (server.listenerCount("error") === 0) {
// 			server.on("error", (err: Error) => {
// 				console.error("[Apathy] unhandled error", err);
// 			});
// 		}

// 		server
// 			.on("request", async (request, response) => {
// 				request
// 					.once("routed", () => {})
// 					.once("error", (err: Error) => {
// 						console.error("[Request] unhandled error", err);
// 						response
// 							.writeHead(500, "Internal Server Error", {
// 								"Content-Type": "text/plain; charset=utf-8",
// 							})
// 							.end();
// 					})
// 					.on("error", (err: Error) => {
// 						server.emit("error", err);
// 					});

// 				const locals: Locals = {};

// 				for await (const callback of request.listeners("route")) {
// 					await callback(locals);
// 				}

// 				if (response.writableEnded) {
// 					// do nothing
// 				} else if (response.headersSent) {
// 					response.end();
// 				} else if (request.listenerCount("routed")) {
// 					response
// 						.writeHead(405, "Method Not Allowed", {
// 							"Content-Type": "text/plain; charset=utf-8",
// 						})
// 						.end();
// 				} else {
// 					response
// 						.writeHead(404, "Not Found", {
// 							"Content-Type": "text/plain; charset=utf-8",
// 						})
// 						.end();
// 				}
// 			})
// 			.listen(
// 				{ host, port },
// 				callback
// 					? () => {
// 							try {
// 								callback({
// 									address: server.address(),
// 									listening: server.listening,
// 									scheme: protocol === "http" ? "http" : "https",
// 								});
// 							} catch (err) {
// 								server.emit("error", err);
// 							}
// 					  }
// 					: undefined
// 			);
// 	},
