import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

apathy({ allowHTTP1: true, cert, key })
	.get("/greet", ({ response, url: { searchParams } }) => {
		const name = searchParams.get("name") ?? "World";

		response.end(`Hello, ${name}!`);
	})
	.listen(port, host, () => {
		console.log(`Listening at https://${host}:${port}`);
	});
