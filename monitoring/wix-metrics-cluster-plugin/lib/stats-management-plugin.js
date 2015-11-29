'use strict';
const express = require('express'),
  exchange = require('wix-cluster-exchange'),
  metrics = require('wix-measured').default;

module.exports.router = ManagementStatsPlugin;

function ManagementStatsPlugin() {
  const app = express.Router();
  const exchangeServer = exchange.server('cluster-stats');

  exchangeServer.onMessage(data => {
    if (data.type === 'stats') {
      metrics.counter('cluster.' + data.id).inc();
    } else if (data.type === 'forked') {
      metrics.counter('cluster.forked').inc();
    } else if (data.type === 'died') {
      metrics.counter('cluster.died').inc();
    }
  });

  app.get('/stats', (req, res) => {
    res.set('Content-Type', 'application/json');
    res.send(metrics.toJSON());
  });

  return app;
}