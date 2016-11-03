'use strict';
const wixCluster = require('../..'),
  express = require('express'),
  rp = require('request-promise');

function worker() {
  process.send({
    origin: 'wix-cluster',
    key: 'statsd',
    value: {
      host: 'localhost',
      interval: 1000
    }
  });

  const app = express()
    .get('/', (req, res) => res.end())
    .get('/die', (req, res) => {
      process.nextTick(() => {
        res.end();
        throw new Error('die');
      });
    });

  return new Promise(resolve => {
    const server = require('http').createServer(app);
    server.listen(3000, () => resolve(() => server.close()));
  });
}

wixCluster.run(worker)
  .then(() => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'started'}}))
  .catch(err => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'failed', err: err}}));
