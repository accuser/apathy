import apathy from "apathy";

apathy("http")
	.get("/greet/:name?", ({ response, params }) => {
		const { name = "World" } = params;

		response.end(`Hello, ${name}!`);
	})
	.listen(3000, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
