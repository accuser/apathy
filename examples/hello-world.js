import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

const api = apathy({ allowHTTP1: true, cert, key });

api
	.all((request, response) => {
		response.end(`Hello, World!`);
	})
	.listen({ host, port }, ({ address }) => {
		if (address === null) {
			// do nothing
		} else if (typeof address === "string") {
			console.log("Listening at", address);
		} else {
			console.log(`Listening at https://${address.address}:${address.port}`);
		}
	});
