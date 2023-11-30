import apathy from "../../dist/index.js";

apathy()
	.get("/", ({ response }) => {
		response.end(JSON.stringify({ hello: "world" }));
	})
	.listen(3000);
