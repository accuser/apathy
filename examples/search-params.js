import apathy from "apathy";

apathy("http")
	.get("/greet", ({ response, url: { searchParams } }) => {
		const name = searchParams.get("name") ?? "World";

		response.end(`Hello, ${name}!`);
	})
	.listen(3000, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
