import apathy from "../dist/index.js";

apathy("http")
	.get("/greet", ({ response, url: { searchParams } }) => {
		const name = searchParams.get("name") ?? "World";

		response.end(`Hello, ${name}!`);
	})
	.listen(({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
