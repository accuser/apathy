import apathy from "apathy";

apathy("http")
	.use(({ request: { httpVersion, method, url } }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
	})
	.all(({ response }) => {
		response.end(`We're talking over HTTP`);
	})
	.listen(8080, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
