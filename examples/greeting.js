import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

apathy({ allowHTTP1: true, cert, key })
	.get("/greet/:name?", ({ response, params }) => {
		const { name = "World" } = params;

		response.end(`Hello, ${name}!`);
	})
	.listen(port, host, () => {
		console.log(`Listening at https://${host}:${port}`);
	});
