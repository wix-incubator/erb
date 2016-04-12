'use strict';
var express = require('express'),
  workerShutdown = require('../../lib/worker-shutdown'),
  cluster = require('cluster');

module.exports = () => {
  var app = express();
  const stats = {};
  process.on('message', msg => {
    if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
      if (msg.key === 'worker-count') {
        stats.workerCount = msg.value;
      } else if (msg.key === 'death-count') {
        stats.deathCount = msg.value;
      } else if (msg.key === 'stats') {
        stats.stats = msg.value;
      }
    }
  });

  app.get('/', (req, res) => {
    setTimeout(() => res.send('Hello'), 500);
  });

  app.get('/id', (req, res) => res.send('' + (cluster.worker ? cluster.worker.id : 'master')));

  app.get('/die', (req, res) => {
    process.nextTick(() => {
      res.end();
      throw 'Error';
    });
  });

  app.get('/stats', (req, res) => {
    res.json(stats);
  });


  const server = app.listen(3000, () => workerShutdown.addResourceToClose(server));
};