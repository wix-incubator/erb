#!/usr/bin/env node
const statsDServer = require('wix-statsd-testkit').server;
const express = require('express');
const server = statsDServer({port: 8125});

server.start();

const app = express();

app.get('/reset', (req, res) => {
  server.clear();
  res.send(200);
});

app.get('/events', (req, res) => res.send(server.events()));
app.get('/events/:pattern', (req, res) => res.send(server.events(req.params.pattern)));

app.listen(3001);
