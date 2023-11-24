import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

apathy({ allowHTTP1: true, cert, key })
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
