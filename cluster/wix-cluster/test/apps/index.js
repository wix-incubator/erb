'use strict';
var express = require('express'),
  workerShutdown = require('../../lib/worker-shutdown'),
  cluster = require('cluster');

module.exports = () => {
  var app = express();

  app.get('/', (req, res) => {
    setTimeout(() => res.send('Hello'), 500);
  });

  app.get('/id', (req, res) => res.send('' + (cluster.worker ? cluster.worker.id : 'master')));

  app.get('/die', (req, res) => {
    process.nextTick(() => {
      throw 'Error';
    });
    res.end();
  });

  const server = app.listen(3000, () => workerShutdown.addResourceToClose(server));
};