'use strict';
var express = require('express'),
  cluster = require('cluster'),
  rp = require('request-promise');

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
      } else if (msg.key === 'broadcast') {
        rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'broadcast', value: msg.value}})
      }
    }
  });

  app.get('/', (req, res) => {
    setTimeout(() => res.send('Hello'), 500);
  });

  app.get('/delay/:duration', (req, res) => {
    setTimeout(() => res.end(), req.params.duration);
  });

  app.get('/delay-event/:duration', (req, res) => {
    setTimeout(() => rp({method: 'POST', uri: 'http://localhost:3004', json: true, body: {evt: 'delayed-completed'}}), req.params.duration);
    res.end();
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

  app.get('/broadcast/:key/:value', (req, res) => {
    process.send({
      origin: 'wix-cluster',
      key: 'broadcast',
      value: { key: req.params.key, value: {value: req.params.value}}
    });
    res.end();
  });

  app.listen(3000);
};