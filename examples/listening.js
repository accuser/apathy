import apathy from "apathy";

apathy("http")
	.all(({ response }) => {
		response.end();
	})
	.listen(3000, ({ address }) => {
		if (address === null) {
			// do nothing
		} else if (typeof address === "string") {
			console.log("Listening at", address);
		} else {
			console.log(`Listening at ${address.address}:${address.port}`);
		}
	});
