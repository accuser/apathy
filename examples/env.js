import { readFileSync } from "node:fs";
import { env } from "node:process";

const { CERT, HOST: host = "localhost", PORT = "3000", KEY } = env;

const cert = CERT
	? Buffer.from(CERT, "base64")
	: readFileSync("./localhost-cert.pem");

const key = KEY
	? Buffer.from(KEY, "base64")
	: readFileSync("./localhost-privkey.pem");

const port = +PORT;

export { cert, host, port, key };
