import apathy from "../dist/index.js";

apathy("http")
	.get("/", ({ response }) => {
		response.end();
	})
	.listen(({ address }) => {
		if (address === null) {
			// do nothing
		} else if (typeof address === "string") {
			console.log("Listening at", address);
		} else {
			console.log(`Listening at ${address.address}:${address.port}`);
		}
	});
