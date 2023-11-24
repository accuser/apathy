import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

const requestLogger = (event) => {
	const {
		request: { method, httpVersion, url },
	} = event;

	console.log(`> ${method} ${url} HTTP/${httpVersion}`);
};

const responseLogger = (event) => {
	const {
		response: { statusCode },
	} = event;

	console.log(`< ${statusCode}`);
};

apathy({ allowHTTP1: true, cert, key })
	.use("/", requestLogger)
	.all("/", ({ response }) => {
		response.end();
	})
	.use("/", responseLogger)
	.listen(port, host, () => {
		console.log(`Listening at https://${host}:${port}`);
	});
