import apathy from "apathy";

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
	.listen(3000, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
