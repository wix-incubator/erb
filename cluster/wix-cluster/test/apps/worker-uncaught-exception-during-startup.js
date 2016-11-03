'use strict';
const wixCluster = require('../..'),
  rp = require('request-promise');

function app() {
  const express = require('express');

  process.nextTick(() => {
    throw new Error('async');
  });

  express()
    .get('/', (req, res) => res.end)
    .listen(3000);
}

wixCluster.run(app, {workerCount: 1})
  .then(() => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'started'}}))
  .catch(err => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'failed', err: err}}));