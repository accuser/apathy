import cluster from "cluster";
import os from "os";
import apathy from "../../dist/index.js";

if (cluster.isPrimary) {
	const numCPUs = os.cpus().length;

	console.log(`Primary process is running: ${process.pid}`);
	console.log(`Forking apathy server on ${numCPUs} CPUs`);

	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(
			`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
		);
		console.log("Starting a new worker");
		cluster.fork();
	});
} else {
	// Worker process
	apathy("http")
		.get("/", ({ response }) => {
			response.writeHead(200, {
				"content-type": "application/json; charset=utf-8",
				"content-length": 17,
			});
			response.end('{"hello":"world"}');
		})
		.listen({ port: 3000 });

	console.log(`Worker ${process.pid} started`);
}
