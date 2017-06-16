#!/usr/bin/env node
const gatekeeperTestkit = require('wix-gatekeeper-testkit');
const express = require('express');
const bodyParser = require('body-parser');

const server = gatekeeperTestkit.server({port: 3001});

server.start();

const app = express();

app.use(bodyParser.json({}));
app.post('/:method', (req, res) => {
  res.send(server[req.params.method].apply(server, req.body));
});

app.listen(3002);
