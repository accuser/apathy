import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

apathy({ allowHTTP1: true, cert, key })
	.get("/", ({ response }) => {
		response.end(`Hello, World!`);
	})
	.listen(port, host, () => {
		console.log(`Listening at https://${host}:${port}`);
	});
