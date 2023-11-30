import apathy from "../dist/index.js";

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

apathy("http")
	.use(requestLogger)
	.all(({ response }) => {
		response.end();
	})
	.use(responseLogger)
	.listen(3000, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
