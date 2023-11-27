import apathy from "apathy";

apathy("http")
	.get(({ response }) => {
		response.end(`Hello, World!`);
	})
	.listen(3000, ({ address, scheme }) => {
		console.log(`Listening at ${scheme}://${address.address}:${address.port}`);
	});
