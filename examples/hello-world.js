import apathy from "../dist/index.js";

apathy("http")
	.get("/", ({ response }) => {
		response.end(`Hello, World!`);
	})
	.listen(({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
