#!/usr/bin/env sh
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
node --eval 'const fs = require("fs"); const cert = fs.readFileSync("localhost-cert.pem").toString("base64"); console.log(`CERT=${cert}`);'
node --eval 'const fs = require("fs"); const cert = fs.readFileSync("localhost-privkey.pem").toString("base64"); console.log(`KEY=${cert}`);'