import apathy from "apathy";
import { cert, host, key, port } from "./env.js";

const a = async ({ locals }) => {
	const { status, statusText } = await fetch("https://google.com");

	locals.a = { status, statusText };
};

const b = ({ locals }) => {
	locals.b = 2;
};

const c = ({ locals }) => {
	locals.c = 3;
};

apathy({ allowHTTP1: true, cert, key })
	.use("/", a, b, c)
	.all("/", async ({ response, locals }) => {
		response.end(JSON.stringify(locals));
	})
	.use("/", ({ locals }) => {
		console.log("locals =", locals);
	})
	.listen(port, host, () => {
		console.log(`Listening at https://${host}:${port}`);
	});
