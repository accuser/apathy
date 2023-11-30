import apathy from "apathy";

apathy("http")
	.get(({ response }) => {
		response.end(`Hello, World!`);
	})
	.listen(3000, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
