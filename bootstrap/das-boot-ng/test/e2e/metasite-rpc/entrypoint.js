#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const rpcServer = require('wix-rpc-testkit').server;

const server = rpcServer({port: 3001});

server.start();

const app = express();

app.get('/reset', (req, res) => {
  server.reset();
  res.send(200);
});

app.use(bodyParser.json({}));
app.post('/when', (req, res) => {
  const [serviceName, methodName, response] = req.body;
  server.when(serviceName, methodName).respond(response);
  res.send(200);
});

app.listen(3002);
