'use strict';
const express = require('express'),
  wixClusterClient = require('../..'),
  wixCluster = require('wix-cluster'),
  cluster = require('cluster');

wixCluster.run(() => {
  const app = express();
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

  app.listen(3000);
});