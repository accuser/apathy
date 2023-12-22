import { Server } from "./server.js";
import { Trie } from "./trie.js";

export interface Router<P extends Server.Protocol>
	extends Server.RequestListener<P> {
	on(...handler: Router.Handler<P>[]): this;
	on(path: string, ...handler: Router.Handler<P>[]): this;
	on(
		method: Router.Method,
		path: string,
		...handler: Router.Handler<P>[]
	): this;
}

export default <P extends Server.Protocol>(
	root = { children: {} } as Trie.Node
): Router<P> =>
	Object.assign(buildHandle(root), {
		on: buildOn(root),
	});

export namespace Router {
	export interface Event<P extends Server.Protocol> {
		locals: Locals;
		request: Server.Request<P>;
		response: Server.Response<P>;
		url: URL;
	}

	export interface Handler<P extends Server.Protocol> {
		(event: Event<P>): void;
	}

	export interface Locals {}

	export const METHODS = {
		DELETE: "DELETE",
		GET: "GET",
		HEAD: "HEAD",
		OPTIONS: "OPTIONS",
		PATCH: "PATCH",
		POST: "POST",
		PUT: "PUT",
	} as const;

	export type Method = keyof typeof METHODS;
}

const buildHandle = <P extends Server.Protocol>(
	root: Trie.Node
): Server.RequestListener<P> =>
	function (this: Router<P>, req, res) {
		const url = new URL(req.url as string, "http://localhost");

		const node =
			url.pathname === "/" ? root : Trie.retrieve(root, url.pathname);

		if (!node) {
			res.writeHead(404, "Not Found", {
				"content-type": "text/plain",
			});
		} else if (Trie.isRouteNode(node)) {
			const handlers = node.route.handlers[req.method as Router.Method];

			if (handlers) {
				const event = {
					locals: {},
					request: req,
					response: res,
					url,
				};

				for (const handler of handlers) {
					handler(event);
				}
			} else
				res.writeHead(405, "Method Not Allowed", {
					"content-type": "text/plain",
				});
		} else
			res.writeHead(404, "Not Found", {
				"content-type": "text/plain",
			});

		if (!res.writableEnded) res.end();
	};

const buildOn = <P extends Server.Protocol>(root: Trie.Node): Router<P>["on"] =>
	function (this: Router<P>, ...args) {
		const method =
			typeof args[0] === "string" && typeof args[1] === "string"
				? (args.shift() as string)
				: undefined;

		const path = typeof args[0] === "string" ? (args.shift() as string) : "/";

		const handler = args as Router.Handler<P>[];

		const node = Trie.insert(root, path);

		if (node === undefined) {
			throw new Error("Oops");
		}

		(method ? [method] : Object.keys(Router.METHODS)).forEach((method) => {
			if (Trie.isRouteNode(node)) {
				(node.route.handlers[method] ||= []).concat(handler);
			} else {
				(node as Trie.RouteNode<P>).route = {
					handlers: { [method]: handler },
					path,
				};
			}
		});

		return this;
	};
