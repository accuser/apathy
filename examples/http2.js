import apathy from "../dist/index.js";
import { cert, key } from "./env.js";

/**
 * Before running this example, generate a local certificate and private key
 * use the `certify.sh` script in the scripts folder.
 *
 * @example
 * ```sh
 * $ cd examples
 * $ ../scripts/certify.sh
 * ```
 */
apathy("http2", { cert, key })
	.get("/", ({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
		response.end(`We're talking over HTTP/2`);
	})
	.listen(8443, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
