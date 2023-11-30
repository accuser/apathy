import apathy from "../dist/index.js";
import { cert, key } from "./env.js";

apathy("https", { cert, key })
	.use(({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
	})
	.all(({ response }) => {
		response.end(`We're talking over HTTPS`);
	})
	.listen(8443, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
