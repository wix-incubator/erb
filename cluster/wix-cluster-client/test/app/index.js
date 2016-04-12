'use strict';
const express = require('express'),
  wixClusterClient = require('../..');

module.exports = () => {
  const app = express();
  const clusterClient = wixClusterClient();

  app.get('/', (req, res) => res.end());
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

  app.listen(3000);

};