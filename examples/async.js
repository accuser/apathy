import apathy, { all, any, one, seq } from "../dist/index.js";

const a = async ({ locals }) => {
	console.log("> a()");

	await new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
		locals.store.push("a: delayed (500ms)");
	});
};

const b = ({ locals }) => {
	console.log("> b()");

	locals.store.push("b: immediate");
};

const c = async ({ locals }) => {
	console.log("> c()");

	await new Promise((resolve) => setTimeout(resolve, 250)).then(() => {
		locals.store.push("c: delayed (250ms)");
	});
};

const d = async ({ locals }) => {
	console.log("> d()*");

	await new Promise((resolve, reject) => setTimeout(reject, 125)).then(() => {
		locals.store.push("d: delayed (125)*");
	});
};

apathy("http")
	.use(({ locals }) => {
		locals.store = [];
	})
	.use(({ locals }) => {
		locals.store.push("SEQ");
	}, seq(a, b, c))
	.use(({ locals }) => {
		locals.store.push("ALL");
	}, all(a, b, c))
	.use(({ locals }) => {
		locals.store.push("ANY");
	}, any(a, b, d))
	.use(({ locals }) => {
		locals.store.push("ONE");
	}, one(a, b, c, d))
	.all(async ({ response, locals: { store } }) => {
		console.log(store);
		response.end(JSON.stringify(store));
	})
	.listen(3000, ({ address }) => {
		console.log(`Listening at ${address.address}:${address.port}`);
	});
