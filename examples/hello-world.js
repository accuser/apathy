import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

apathy({ allowHTTP1: true, cert, key })
	.use("/", ({ request }) => {
		const { method, httpVersion, url } = request;

		console.log(`${method} ${url} HTTP/${httpVersion}`);
	})
	.get("/", ({ response }) => {
		response.end(`Hello, World!`);
	})
	.listen(port, host, ({ address }) => {
		if (address === null) {
			// do nothing
		} else if (typeof address === "string") {
			console.log("Listening at", address);
		} else {
			console.log(`Listening at https://${address.address}:${address.port}`);
		}
	});
