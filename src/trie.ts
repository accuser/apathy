import { Router } from "./router.js";
import { Server } from "./server.js";

export namespace Trie {
	export interface Node {
		children: Record<string, Node>;
	}

	export interface ParamNode extends Node {
		param: {
			segment: string;
			keys: string[];
			pattern: RegExp;
		};
	}

	export interface RouteNode<P extends Server.Protocol> extends Node {
		route: {
			handlers: Partial<Record<string, Router.Handler<P>[]>>;
			path: string;
		};
	}

	export const isRouteNode = <P extends Server.Protocol>(
		node: Node
	): node is RouteNode<P> => (node as RouteNode<P>).route !== undefined;

	export const insert = (root: Node, path = "/") => {
		if (path === "/") return root;

		let node = root;
		let segment = "";

		const length = path.length;
		const lastIndex = length - 1;

		for (let i = 0; ++i < length; ) {
			const char = path[i];

			if (char !== "/") {
				segment += char;
			}

			if (i === lastIndex || char === "/") {
				node = segment
					? segment[0] === ":"
						? (node.children[":"] ||= {
								children: {},
								param: { segment },
						  } as ParamNode)
						: (node.children[segment] ||= {
								children: {},
						  } as Node)
					: node;

				if (node) {
					segment = "";
				} else {
					return undefined;
				}
			}
		}

		return node;
	};

	export const retrieve = (root: Node, path = "/") => {
		if (path === "/") return root;

		let node = root;
		let segment = "";

		const length = path.length;
		const lastIndex = length - 1;

		for (let i = 0; ++i < length; ) {
			const char = path[i];

			if (char !== "/") {
				segment += char;
			}

			if (i === lastIndex || char === "/") {
				node = node.children[segment] || node.children[":"];

				if (node) {
					segment = "";
				} else {
					return undefined;
				}
			}
		}

		return node;
	};
}
