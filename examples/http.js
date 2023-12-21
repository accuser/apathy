import apathy from "../dist/index.js";

apathy("http")
	.get("/", ({ request: { httpVersion, method, url }, response }) => {
		console.log(`${method} ${url} HTTP/${+httpVersion}`);
		response.end(`We're talking over HTTP`);
	})
	.listen(8080, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
