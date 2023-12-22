import { readFileSync } from "node:fs";
import { env } from "node:process";

const { CERT, KEY } = env;

const cert = CERT
	? Buffer.from(CERT, "base64")
	: readFileSync("./localhost-cert.pem");

const key = KEY
	? Buffer.from(KEY, "base64")
	: readFileSync("./localhost-privkey.pem");

export { cert, key };
