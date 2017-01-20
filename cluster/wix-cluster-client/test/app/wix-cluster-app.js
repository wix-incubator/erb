'use strict';
const express = require('express'),
  wixClusterClient = require('../..'),
  wixCluster = require('wix-cluster'),
  cluster = require('cluster'),
  bodyParser = require('body-parser');

if (cluster.isMaster) {

  let statsMsg = {};
  cluster.on('message', (worker, msg) => {
    if (msg && msg.origin && msg.origin === 'wix-cluster' && msg.key && msg.key === 'statsd') {
      statsMsg = msg.value
    }
  });

  express()
    .get('/on-statsd', (req, res) => res.json(statsMsg))
    .listen(3004);
}

wixCluster.run(() => {
  const app = express()
    .use(bodyParser.json());

  const clusterClient = wixClusterClient();
  clusterClient.on('aKey', data => {
      console.log(`worker-${clusterClient.workerId} received event aKey with value ${data.value}`);
  });

  app.get('/', (req, res) => res.end());

  app.get('/id', (req, res) => {
    res.json({
      id: clusterClient.workerId,
      workerId: cluster.worker.id
    })
  });

  app.get('/stats', (req, res) => res.send({
    workerCount: clusterClient.workerCount,
    deathCount: clusterClient.deathCount,
    stats: clusterClient.stats
  }));

  app.get('/die', (req, res) => {
    process.nextTick(() => {
      throw new Error('woops');
    });
    setTimeout(() => res.end(), 100);
  });

  app.get('/emit/:msg', (req, res) => {
    clusterClient.emit('aKey', {value: req.params.msg});
    res.end();
  });

  app.post('/emit-statsd', (req, res) => {
    clusterClient.configureStatsD(req.body);
    res.end();
  });

  app.listen(3000);
}, {metrics: {app_host: 'local', app_name: 'app'}});
