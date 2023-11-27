import apathy from "apathy";
import { cert, key } from "./env.js";

apathy("https", { cert, key })
	.use(({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
	})
	.all(({ response }) => {
		response.end(`We're talking over HTTPS`);
	})
	.listen(8443, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
