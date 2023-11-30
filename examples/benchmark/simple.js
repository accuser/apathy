import apathy from "apathy";

apathy()
	.get("/", ({ response }) => {
		response.end(JSON.stringify({ hello: "world" }));
	})
	.listen(3000);
