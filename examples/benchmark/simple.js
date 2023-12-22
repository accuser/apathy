import apathy from "../../dist/index.js";

apathy("http")
	.get("/", ({ response }) => {
		response.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"content-length": 17,
		});
		response.end('{"hello":"world"}');
	})
	.listen();
