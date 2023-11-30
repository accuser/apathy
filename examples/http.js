import apathy from "../dist/index.js";

apathy("http")
	.use(({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
	})
	.all(({ response }) => {
		response.end(`We're talking over HTTP`);
	})
	.listen(8080, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
