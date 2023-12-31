import apathy from "apathy";
import { cert, key } from "./env.js";

apathy("http2", { cert, key })
	.use(({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
	})
	.all(({ response }) => {
		response.end();
	})
	.listen(8443, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
